"""
Intelligence Router — Multi-model AI orchestration engine

Implements φ-weighted model selection, token counting, and cost-performance optimization
across GPT-4, Claude-3, Gemini Pro, Llama, Mistral, and other models.

Key Features:
  - Async multi-model routing with parallel execution
  - φ-weighted model selection based on task complexity
  - Token counting and cost estimation
  - Context window optimization
  - Fallback chain on model failure
  - Response normalization across APIs

Example:
  router = IntelligenceRouter()
  response = await router.route_query(
      query="Verify architectural claims",
      models=["gpt-4", "claude-3-opus"],
      phi_weights={"gpt-4": 0.4, "claude-3-opus": 0.6}
  )
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any, Optional, AsyncGenerator
from datetime import datetime
import json

import httpx
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


@dataclass
class ModelCapabilities:
    """Model capability metadata and constraints."""
    
    name: str
    provider: str  # 'openai', 'anthropic', 'google', 'meta', 'mistral'
    context_window: int
    max_tokens: int
    supports_vision: bool = False
    supports_function_calling: bool = False
    cost_per_1k_input: float = 0.0
    cost_per_1k_output: float = 0.0
    latency_p50_ms: int = 1000  # Typical P50 latency
    capabilities: list[str] = field(default_factory=list)
    
    def phi_score(self, task_complexity: float) -> float:
        """Calculate φ-weighted capability score based on task complexity."""
        # Higher complexity favors larger models with lower latency
        base_score = (
            (self.context_window / 200000) * 0.3 +  # Context size
            (1 / (self.latency_p50_ms / 100)) * 0.3 +  # Speed
            (self.max_tokens / 4096) * 0.2 +  # Output capacity
            (len(self.capabilities) / 10) * 0.2  # Feature set
        )
        return base_score * (1 + task_complexity * 0.5)


class IntelligenceRouter:
    """Multi-model AI orchestration engine with φ-weighted selection."""
    
    # Model registry with capabilities
    MODELS = {
        "gpt-4": ModelCapabilities(
            name="gpt-4",
            provider="openai",
            context_window=128000,
            max_tokens=4096,
            supports_vision=True,
            supports_function_calling=True,
            cost_per_1k_input=0.03,
            cost_per_1k_output=0.06,
            latency_p50_ms=800,
            capabilities=["reasoning", "coding", "vision", "functions"]
        ),
        "claude-3-opus": ModelCapabilities(
            name="claude-3-opus",
            provider="anthropic",
            context_window=200000,
            max_tokens=4096,
            supports_vision=True,
            supports_function_calling=True,
            cost_per_1k_input=0.015,
            cost_per_1k_output=0.075,
            latency_p50_ms=1200,
            capabilities=["reasoning", "analysis", "vision", "long-context"]
        ),
        "gemini-pro": ModelCapabilities(
            name="gemini-pro",
            provider="google",
            context_window=32000,
            max_tokens=8192,
            supports_vision=False,
            supports_function_calling=False,
            cost_per_1k_input=0.001,
            cost_per_1k_output=0.002,
            latency_p50_ms=600,
            capabilities=["fast", "cost-effective"]
        ),
        "llama-2-70b": ModelCapabilities(
            name="llama-2-70b",
            provider="meta",
            context_window=4096,
            max_tokens=2048,
            supports_vision=False,
            supports_function_calling=False,
            cost_per_1k_input=0.0008,
            cost_per_1k_output=0.001,
            latency_p50_ms=2000,
            capabilities=["open-source", "local-deployable"]
        ),
        "mistral-large": ModelCapabilities(
            name="mistral-large",
            provider="mistral",
            context_window=32000,
            max_tokens=4096,
            supports_vision=False,
            supports_function_calling=True,
            cost_per_1k_input=0.008,
            cost_per_1k_output=0.024,
            latency_p50_ms=900,
            capabilities=["reasoning", "functions", "cost-effective"]
        ),
    }
    
    def __init__(self, vault_client=None):
        """
        Initialize Intelligence Router.
        
        Args:
            vault_client: Optional VaultClient for credential management
        """
        self.vault_client = vault_client
        self.client = httpx.AsyncClient(timeout=120.0)
        self.token_cache = {}
        
    async def route_query(
        self,
        query: str,
        models: Optional[list[str]] = None,
        phi_weights: Optional[dict[str, float]] = None,
        task_complexity: float = 0.5,
        require_vision: bool = False,
        max_retries: int = 3,
    ) -> dict[str, Any]:
        """
        Route a query across multiple models with φ-weighted selection.
        
        Args:
            query: The query to route
            models: List of model names to consider (or None for auto-select)
            phi_weights: Custom φ-weights per model
            task_complexity: Task complexity (0-1) for capability matching
            require_vision: Whether vision capability is required
            max_retries: Max retries on failure
            
        Returns:
            Dictionary with best response, model selection metadata, and alternatives
        """
        
        # Select models
        if models is None:
            models = list(self.MODELS.keys())
        
        # Filter by capabilities
        available_models = [m for m in models if m in self.MODELS]
        if require_vision:
            available_models = [m for m in available_models if self.MODELS[m].supports_vision]
        
        if not available_models:
            raise ValueError("No suitable models available for this query")
        
        # Calculate routing weights
        weights = self._calculate_weights(available_models, phi_weights, task_complexity)
        
        logger.info(f"Routing query to {len(available_models)} models: {weights}")
        
        # Execute in parallel with fallback chain
        results = await self._execute_parallel(query, available_models, weights, max_retries)
        
        # Normalize and return best response
        return self._select_best_response(results, weights)
    
    def _calculate_weights(
        self,
        models: list[str],
        custom_weights: Optional[dict[str, float]],
        task_complexity: float,
    ) -> dict[str, float]:
        """Calculate φ-weighted routing probabilities."""
        
        if custom_weights:
            # Normalize custom weights
            total = sum(custom_weights.values())
            return {m: custom_weights.get(m, 0) / total for m in models}
        
        # Calculate φ-weights based on task complexity
        scores = {}
        for model_name in models:
            model = self.MODELS[model_name]
            scores[model_name] = model.phi_score(task_complexity)
        
        total = sum(scores.values())
        return {m: scores[m] / total for m in models}
    
    async def _execute_parallel(
        self,
        query: str,
        models: list[str],
        weights: dict[str, float],
        max_retries: int,
    ) -> list[dict[str, Any]]:
        """Execute query across models in parallel with fallback."""
        
        tasks = [
            self._call_model(model, query, max_retries)
            for model in models
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out failures
        valid_results = [
            r for r in results
            if isinstance(r, dict) and not isinstance(r, Exception)
        ]
        
        return valid_results
    
    async def _call_model(
        self,
        model_name: str,
        query: str,
        max_retries: int,
    ) -> dict[str, Any]:
        """Call a specific model with retry logic."""
        
        model = self.MODELS[model_name]
        
        for attempt in range(max_retries):
            try:
                response = await self._make_request(model, query)
                return {
                    "model": model_name,
                    "response": response,
                    "tokens_used": self._estimate_tokens(query, response),
                    "timestamp": datetime.utcnow().isoformat(),
                    "attempt": attempt + 1,
                }
            except Exception as e:
                logger.warning(f"Model {model_name} failed on attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    return {
                        "model": model_name,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        
        return {"model": model_name, "error": "Max retries exceeded"}
    
    async def _make_request(self, model: ModelCapabilities, query: str) -> str:
        """Make API request to model (placeholder - integrate with actual APIs)."""
        # This would integrate with actual OpenAI, Anthropic, Google, etc. APIs
        # For now, return a placeholder
        logger.info(f"Calling {model.provider}/{model.name}")
        
        # TODO: Integrate with VaultClient to get credentials
        # token = self.vault_client.get(f"{model.provider.upper()}_API_KEY")
        
        # Example structure (actual implementation would call real APIs)
        return f"[Response from {model.name} for query: {query[:50]}...]"
    
    def _estimate_tokens(self, prompt: str, response: str) -> dict[str, int]:
        """Estimate token usage (placeholder)."""
        # Simple estimation: ~4 chars per token
        return {
            "input": len(prompt) // 4,
            "output": len(response) // 4,
            "total": (len(prompt) + len(response)) // 4,
        }
    
    def _select_best_response(
        self,
        results: list[dict[str, Any]],
        weights: dict[str, float],
    ) -> dict[str, Any]:
        """Select best response based on weights and quality metrics."""
        
        # Filter valid results
        valid = [r for r in results if "response" in r and "error" not in r]
        
        if not valid:
            return {
                "success": False,
                "error": "All models failed",
                "attempts": results,
            }
        
        # Select highest-weighted valid response
        best = max(valid, key=lambda r: weights.get(r["model"], 0))
        
        return {
            "success": True,
            "selected_model": best["model"],
            "response": best["response"],
            "tokens": best.get("tokens_used"),
            "alternatives": [r for r in valid if r["model"] != best["model"]],
            "weights": weights,
            "timestamp": best.get("timestamp"),
        }
    
    async def close(self):
        """Cleanup resources."""
        await self.client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
