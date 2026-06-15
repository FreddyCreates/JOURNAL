"""
Worker Orchestrator — Scheduling, orchestration, and multi-language interop

Manages autonomous worker lifecycle, scheduling, and cross-language execution
with Julia, Rust, Haskell, and Node.js backends.

Key Features:
  - Task scheduling and execution planning
  - Multi-language subprocess execution (Julia, Rust, Haskell, Node)
  - Worker lifecycle management
  - Cross-domain workflow orchestration
  - Real-time execution monitoring
  - Failure recovery and retry logic
  - Performance metrics collection

Example:
  orchestrator = WorkerOrchestrator(workers=registry, memory_vault=vault)
  
  result = await orchestrator.execute_workflow(
      workflow_name="verify-and-publish",
      tasks=[task1, task2, task3],
      parallel=False
  )
"""

from __future__ import annotations

import asyncio
import subprocess
import logging
import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional, List, Dict, Callable
from enum import Enum
from pathlib import Path
import os

logger = logging.getLogger(__name__)


# ============================================================================
# Language Execution Backends
# ============================================================================


class Language(Enum):
    """Supported execution languages."""
    PYTHON = "python"
    JULIA = "julia"
    RUST = "rust"
    HASKELL = "haskell"
    NODE = "node"


@dataclass
class LanguageRuntime:
    """Language runtime configuration."""
    
    language: Language
    executable: str
    entrypoint: str
    env_vars: Dict[str, str] = field(default_factory=dict)
    timeout: float = 300.0
    
    @classmethod
    def julia(cls, timeout: float = 300.0) -> LanguageRuntime:
        """Create Julia runtime."""
        return cls(
            language=Language.JULIA,
            executable="julia",
            entrypoint="julia/thesis.jl",
            timeout=timeout,
        )
    
    @classmethod
    def rust(cls, timeout: float = 300.0) -> LanguageRuntime:
        """Create Rust runtime."""
        return cls(
            language=Language.RUST,
            executable="cargo",
            entrypoint="run",
            timeout=timeout,
        )
    
    @classmethod
    def haskell(cls, timeout: float = 300.0) -> LanguageRuntime:
        """Create Haskell runtime."""
        return cls(
            language=Language.HASKELL,
            executable="runhaskell",
            entrypoint="haskell/src/Main.hs",
            timeout=timeout,
        )
    
    @classmethod
    def node(cls, timeout: float = 300.0) -> LanguageRuntime:
        """Create Node.js runtime."""
        return cls(
            language=Language.NODE,
            executable="node",
            entrypoint="sdk/index.js",
            timeout=timeout,
        )


class LanguageExecutor:
    """Execute code in various languages via subprocess."""
    
    def __init__(self, runtime: LanguageRuntime):
        """Initialize language executor."""
        self.runtime = runtime
    
    async def execute(
        self,
        code_or_script: str,
        input_data: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Execute code in language runtime.
        
        Args:
            code_or_script: Code snippet or script path
            input_data: Input data (JSON)
            
        Returns:
            Result from execution
        """
        try:
            # Prepare input
            input_json = json.dumps(input_data or {})
            
            # Build command based on language
            if self.runtime.language == Language.JULIA:
                cmd = [
                    self.runtime.executable,
                    self.runtime.entrypoint,
                ]
            elif self.runtime.language == Language.RUST:
                cmd = [
                    self.runtime.executable,
                    self.runtime.entrypoint,
                ]
            elif self.runtime.language == Language.HASKELL:
                cmd = [
                    self.runtime.executable,
                    self.runtime.entrypoint,
                ]
            elif self.runtime.language == Language.NODE:
                cmd = [
                    self.runtime.executable,
                    self.runtime.entrypoint,
                ]
            else:
                raise ValueError(f"Unsupported language: {self.runtime.language}")
            
            # Execute subprocess
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={**os.environ, **self.runtime.env_vars},
            )
            
            # Send input and get output
            stdout, stderr = await asyncio.wait_for(
                process.communicate(input_json.encode()),
                timeout=self.runtime.timeout,
            )
            
            # Parse output
            try:
                result = json.loads(stdout.decode())
                return result
            except json.JSONDecodeError:
                return {
                    "status": "completed",
                    "output": stdout.decode(),
                    "stderr": stderr.decode(),
                }
        
        except asyncio.TimeoutError:
            logger.error(f"Execution timed out for {self.runtime.language}")
            raise
        except Exception as e:
            logger.error(f"Execution error for {self.runtime.language}: {e}")
            raise


# ============================================================================
# Workflow Models
# ============================================================================


@dataclass
class WorkflowStep:
    """Step in a workflow."""
    
    step_id: str
    name: str
    worker_id: Optional[str] = None
    language: Optional[Language] = None
    task_payload: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)  # step_ids
    timeout: float = 300.0
    required_success: bool = True
    
    # Results
    status: str = "pending"  # pending, running, completed, failed
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@dataclass
class Workflow:
    """Multi-step workflow for worker orchestration."""
    
    workflow_id: str
    name: str
    description: str
    steps: List[WorkflowStep] = field(default_factory=list)
    parallel_execution: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # State
    status: str = "pending"  # pending, running, completed, failed
    results: Dict[str, Any] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)


# ============================================================================
# Worker Orchestrator
# ============================================================================


class WorkerOrchestrator:
    """Orchestrates autonomous workers and cross-language execution."""
    
    def __init__(
        self,
        worker_registry=None,
        memory_vault=None,
        governance_executor=None,
        cross_domain_workflow=None,
    ):
        """
        Initialize orchestrator.
        
        Args:
            worker_registry: SovereignWorkerRegistry
            memory_vault: MemoryVault instance
            governance_executor: GovernanceExecutor instance
            cross_domain_workflow: CrossDomainWorkflow instance
        """
        self.worker_registry = worker_registry
        self.memory_vault = memory_vault
        self.governance_executor = governance_executor
        self.cross_domain_workflow = cross_domain_workflow
        
        # Language executors
        self.language_executors: Dict[Language, LanguageExecutor] = {
            Language.JULIA: LanguageExecutor(LanguageRuntime.julia()),
            Language.RUST: LanguageExecutor(LanguageRuntime.rust()),
            Language.HASKELL: LanguageExecutor(LanguageRuntime.haskell()),
            Language.NODE: LanguageExecutor(LanguageRuntime.node()),
        }
        
        # Active workflows
        self.workflows: Dict[str, Workflow] = {}
        self.execution_history: List[Dict[str, Any]] = []
    
    async def create_workflow(
        self,
        name: str,
        description: str = "",
        parallel: bool = False,
    ) -> Workflow:
        """
        Create a new workflow.
        
        Args:
            name: Workflow name
            description: Workflow description
            parallel: Execute steps in parallel
            
        Returns:
            New Workflow instance
        """
        import uuid
        workflow_id = f"workflow-{uuid.uuid4().hex[:12]}"
        workflow = Workflow(
            workflow_id=workflow_id,
            name=name,
            description=description,
            parallel_execution=parallel,
        )
        self.workflows[workflow_id] = workflow
        return workflow
    
    def add_step(
        self,
        workflow: Workflow,
        step_id: str,
        name: str,
        worker_id: Optional[str] = None,
        language: Optional[Language] = None,
        task_payload: Dict[str, Any] = None,
        dependencies: List[str] = None,
    ) -> WorkflowStep:
        """
        Add step to workflow.
        
        Args:
            workflow: Target workflow
            step_id: Unique step identifier
            name: Step name
            worker_id: Worker to execute step
            language: Language for execution
            task_payload: Task input data
            dependencies: Required prior steps
            
        Returns:
            New WorkflowStep
        """
        step = WorkflowStep(
            step_id=step_id,
            name=name,
            worker_id=worker_id,
            language=language,
            task_payload=task_payload or {},
            dependencies=dependencies or [],
        )
        workflow.steps.append(step)
        return step
    
    async def execute_workflow(
        self,
        workflow: Workflow,
    ) -> Dict[str, Any]:
        """
        Execute a complete workflow.
        
        Args:
            workflow: Workflow to execute
            
        Returns:
            Execution results
        """
        workflow.status = "running"
        workflow.started_at = datetime.utcnow()
        
        try:
            if workflow.parallel_execution:
                await self._execute_parallel(workflow)
            else:
                await self._execute_sequential(workflow)
            
            workflow.status = "completed"
            workflow.completed_at = datetime.utcnow()
        
        except Exception as e:
            workflow.status = "failed"
            workflow.errors.append(str(e))
            logger.error(f"Workflow {workflow.workflow_id} failed: {e}")
        
        # Store execution history
        self.execution_history.append({
            "workflow_id": workflow.workflow_id,
            "name": workflow.name,
            "status": workflow.status,
            "executed_at": datetime.utcnow().isoformat(),
            "results": workflow.results,
        })
        
        return {
            "workflow_id": workflow.workflow_id,
            "status": workflow.status,
            "results": workflow.results,
            "errors": workflow.errors,
        }
    
    async def _execute_sequential(self, workflow: Workflow):
        """Execute workflow steps sequentially."""
        for step in workflow.steps:
            await self._execute_step(workflow, step)
    
    async def _execute_parallel(self, workflow: Workflow):
        """Execute workflow steps in parallel."""
        # Group steps by dependencies
        tasks = []
        for step in workflow.steps:
            tasks.append(asyncio.create_task(self._execute_step(workflow, step)))
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _execute_step(self, workflow: Workflow, step: WorkflowStep):
        """Execute a single workflow step."""
        try:
            # Check dependencies
            for dep_id in step.dependencies:
                dep_step = next((s for s in workflow.steps if s.step_id == dep_id), None)
                if dep_step and dep_step.status != "completed":
                    if step.required_success:
                        raise RuntimeError(f"Dependency {dep_id} not completed")
            
            step.status = "running"
            
            # Execute step
            if step.worker_id and self.worker_registry:
                # Execute via worker
                worker = self.worker_registry.get_worker(step.worker_id)
                if worker:
                    from .sovereign_workers import WorkerTask
                    task = WorkerTask(
                        name=step.name,
                        payload=step.task_payload,
                        timeout_seconds=step.timeout,
                    )
                    result = await worker.execute_task(task)
                    step.result = result.result
                else:
                    raise RuntimeError(f"Worker {step.worker_id} not found")
            
            elif step.language:
                # Execute via language runtime
                executor = self.language_executors.get(step.language)
                if executor:
                    step.result = await executor.execute(
                        code_or_script="",
                        input_data=step.task_payload,
                    )
                else:
                    raise RuntimeError(f"Language {step.language} not supported")
            
            else:
                step.result = step.task_payload
            
            step.status = "completed"
            workflow.results[step.step_id] = step.result
        
        except Exception as e:
            step.status = "failed"
            step.error = str(e)
            workflow.errors.append(f"Step {step.step_id}: {e}")
            logger.error(f"Step {step.step_id} failed: {e}")
    
    async def compose_and_execute(
        self,
        workflow_name: str,
        steps_config: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Compose and execute a workflow from configuration.
        
        Args:
            workflow_name: Name of workflow
            steps_config: List of step configurations
            
        Returns:
            Execution results
        """
        workflow = await self.create_workflow(workflow_name)
        
        for config in steps_config:
            self.add_step(
                workflow=workflow,
                step_id=config.get("step_id", f"step-{len(workflow.steps)}"),
                name=config.get("name", ""),
                worker_id=config.get("worker_id"),
                language=Language(config["language"]) if "language" in config else None,
                task_payload=config.get("payload", {}),
                dependencies=config.get("dependencies", []),
            )
        
        return await self.execute_workflow(workflow)
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow execution status."""
        workflow = self.workflows.get(workflow_id)
        if not workflow:
            return None
        
        return {
            "workflow_id": workflow.workflow_id,
            "name": workflow.name,
            "status": workflow.status,
            "steps": [
                {
                    "step_id": s.step_id,
                    "name": s.name,
                    "status": s.status,
                    "result": s.result,
                    "error": s.error,
                }
                for s in workflow.steps
            ],
            "results": workflow.results,
            "errors": workflow.errors,
        }
    
    def get_execution_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get execution history."""
        return self.execution_history[-limit:]


__all__ = [
    "Language",
    "LanguageRuntime",
    "LanguageExecutor",
    "WorkflowStep",
    "Workflow",
    "WorkerOrchestrator",
]
