"""Intelligence Router CLI."""

import asyncio
import argparse
import json
from pathlib import Path

from . import IntelligenceRouter


async def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Sovereign Organism Intelligence Router"
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # verify-routing command
    verify_parser = subparsers.add_parser(
        "verify-routing",
        help="Verify routing with test queries"
    )
    verify_parser.add_argument(
        "--models",
        nargs="+",
        default=["gpt-4", "claude-3-opus", "gemini-pro"],
        help="Models to test"
    )
    verify_parser.add_argument(
        "--complexity",
        type=float,
        default=0.5,
        help="Task complexity (0-1)"
    )
    
    # route command
    route_parser = subparsers.add_parser(
        "route",
        help="Route a query"
    )
    route_parser.add_argument("query", help="Query to route")
    route_parser.add_argument(
        "--models",
        nargs="+",
        help="Models to use"
    )
    route_parser.add_argument(
        "--output",
        type=Path,
        help="Output file for results"
    )
    
    # list-models command
    subparsers.add_parser("list-models", help="List available models")
    
    args = parser.parse_args()
    
    async with IntelligenceRouter() as router:
        if args.command == "verify-routing":
            await verify_routing(router, args)
        elif args.command == "route":
            await route_query(router, args)
        elif args.command == "list-models":
            list_models(router)
        else:
            parser.print_help()


async def verify_routing(router, args):
    """Verify routing configuration."""
    print(f"Verifying routing with models: {args.models}")
    print(f"Task complexity: {args.complexity}")
    print()
    
    test_queries = [
        "What is sovereign AI architecture?",
        "Verify the claim that self-healing systems prevent failures",
        "Describe quantum coherence protocols",
    ]
    
    for query in test_queries:
        print(f"Query: {query}")
        print("-" * 80)
        
        result = await router.route_query(
            query=query,
            models=args.models,
            task_complexity=args.complexity,
        )
        
        print(f"Selected model: {result['selected_model']}")
        print(f"Weights: {json.dumps(result['weights'], indent=2)}")
        print(f"Response: {result['response']}")
        print()


async def route_query(router, args):
    """Route a single query."""
    print(f"Routing query: {args.query}")
    print()
    
    result = await router.route_query(
        query=args.query,
        models=args.models,
    )
    
    output = json.dumps(result, indent=2)
    print(output)
    
    if args.output:
        args.output.write_text(output)
        print(f"Results saved to {args.output}")


def list_models(router):
    """List available models."""
    print("Available Models:")
    print("=" * 80)
    
    for name, model in router.MODELS.items():
        print(f"\n{name}")
        print(f"  Provider: {model.provider}")
        print(f"  Context: {model.context_window:,} tokens")
        print(f"  Max output: {model.max_tokens:,} tokens")
        print(f"  Capabilities: {', '.join(model.capabilities)}")
        print(f"  Cost (1k input): ${model.cost_per_1k_input}")
        print(f"  Cost (1k output): ${model.cost_per_1k_output}")
        print(f"  P50 Latency: {model.latency_p50_ms}ms")


if __name__ == "__main__":
    asyncio.run(main())
