"""
Sovereign AI Workers - Integration Example

Demonstrates complete usage of autonomous workers, orchestration,
and multi-language execution across the Sovereign Organism platform.
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path

# Import sovereign system
try:
    from sovereign import create_integrated_system
except ImportError:
    import sys
    sys.path.insert(0, str(Path(__file__).parent / "src" / "python"))
    from sovereign import create_integrated_system


async def example_1_basic_worker_execution():
    """
    Example 1: Basic worker creation and task execution.
    
    Creates a worker, submits a task, and monitors execution.
    """
    print("\n" + "="*80)
    print("Example 1: Basic Worker Execution")
    print("="*80)
    
    # Create integrated system
    system = create_integrated_system()
    registry = system.get("worker_registry")
    
    if not registry:
        print("Worker registry not available")
        return
    
    # Create worker
    worker = registry.create_worker(
        name="TestWorker",
        description="Example worker for testing",
        capabilities=["test-capability"],
    )
    
    print(f"Created worker: {worker.worker_id}")
    print(f"Name: {worker.name}")
    print(f"Capabilities: {worker.capabilities}")
    
    # Start worker
    await worker.start()
    print(f"Worker started at {datetime.utcnow().isoformat()}")
    
    # Submit a task
    from sovereign_workers import WorkerTask
    
    task = WorkerTask(
        name="Test Task",
        description="Test task execution",
        payload={"test": "data", "value": 42},
    )
    
    print(f"\nSubmitting task: {task.task_id}")
    result_task = await worker.execute_task(task)
    
    print(f"Task status: {result_task.status.value}")
    print(f"Execution time: {result_task.execution_time:.2f}s")
    print(f"Result: {result_task.result}")
    
    # Get worker status
    status = worker.get_status()
    print(f"\nWorker Statistics:")
    print(f"  Total tasks: {status['statistics']['total_tasks']}")
    print(f"  Completed: {status['statistics']['completed_tasks']}")
    print(f"  Failed: {status['statistics']['failed_tasks']}")
    print(f"  Avg time: {status['statistics']['average_execution_time']:.2f}s")
    print(f"  Uptime: {status['runtime_clock']['uptime_seconds']:.2f}s")
    
    # Stop worker
    await worker.stop()
    print(f"\nWorker stopped at {datetime.utcnow().isoformat()}")


async def example_2_specialized_workers():
    """
    Example 2: Specialized workers (AURO, THESIS, CIVOS, SENTINEL).
    
    Demonstrates domain-specific workers with real integration.
    """
    print("\n" + "="*80)
    print("Example 2: Specialized Workers")
    print("="*80)
    
    # Create integrated system
    system = create_integrated_system()
    registry = system.get("worker_registry")
    specialized = system.get("specialized_workers", {})
    
    if not registry or not specialized:
        print("Specialized workers not available")
        return
    
    # Start all workers
    for name, worker in specialized.items():
        await worker.start()
        print(f"Started {name} worker: {worker.worker_id}")
    
    # Example 1: AURO Paper Generation
    print("\n--- AURO Paper Generation ---")
    if "AURO" in specialized:
        from sovereign_workers import WorkerTask
        
        auro = specialized["AURO"]
        task = WorkerTask(
            name="Generate Architecture Paper",
            payload={
                "title": "Sovereign Intelligence Architecture",
                "content": "This paper describes the architecture of the Sovereign Organism platform...",
                "category": "architecture",
            },
        )
        
        result = await auro.execute_task(task)
        print(f"AURO Result: {json.dumps(result.result, indent=2)}")
    
    # Example 2: THESIS Claim Verification
    print("\n--- THESIS Claim Verification ---")
    if "THESIS" in specialized:
        from sovereign_workers import WorkerTask
        
        thesis = specialized["THESIS"]
        task = WorkerTask(
            name="Verify Architectural Claims",
            payload={
                "claim": "The sovereign architecture enables autonomous AI workers",
                "evidence_sources": [
                    "docs/papers/architecture/",
                    "docs/journals/",
                ],
            },
        )
        
        result = await thesis.execute_task(task)
        print(f"THESIS Result: {json.dumps(result.result, indent=2)}")
    
    # Example 3: CIVOS Governance Enforcement
    print("\n--- CIVOS Governance Enforcement ---")
    if "CIVOS" in specialized:
        from sovereign_workers import WorkerTask
        
        civos = specialized["CIVOS"]
        task = WorkerTask(
            name="Enforce Governance Law",
            payload={
                "law_name": "sovereign-vault",
                "context": {
                    "action": "access_vault",
                    "actor": "AURO-001",
                },
            },
        )
        
        result = await civos.execute_task(task)
        print(f"CIVOS Result: {json.dumps(result.result, indent=2)}")
    
    # Example 4: SENTINEL Memory Indexing
    print("\n--- SENTINEL Memory Indexing ---")
    if "SENTINEL" in specialized:
        from sovereign_workers import WorkerTask
        
        sentinel = specialized["SENTINEL"]
        task = WorkerTask(
            name="Index Memory",
            payload={
                "operation": "index-memory",
                "content": "Important execution data from architectural verification process",
                "tags": ["architecture", "verification", "execution"],
            },
        )
        
        result = await sentinel.execute_task(task)
        print(f"SENTINEL Result: {json.dumps(result.result, indent=2)}")
    
    # Stop all workers
    for name, worker in specialized.items():
        await worker.stop()
        print(f"\nStopped {name} worker")


async def example_3_workflow_orchestration():
    """
    Example 3: Multi-step workflow orchestration.
    
    Demonstrates chaining tasks across workers with dependencies.
    """
    print("\n" + "="*80)
    print("Example 3: Workflow Orchestration")
    print("="*80)
    
    # Create integrated system
    system = create_integrated_system()
    orchestrator = system.get("worker_orchestrator")
    registry = system.get("worker_registry")
    
    if not orchestrator or not registry:
        print("Orchestrator not available")
        return
    
    # Start workers
    for worker in registry.workers.values():
        await worker.start()
    
    # Create workflow
    workflow = await orchestrator.create_workflow(
        name="Verify and Publish Research",
        description="Verify claims, generate paper, enforce governance, and publish",
        parallel=False,  # Sequential execution
    )
    
    print(f"Created workflow: {workflow.workflow_id}")
    
    # Add steps
    orchestrator.add_step(
        workflow=workflow,
        step_id="verify",
        name="Verify Research Claims",
        worker_id=list(registry.workers.values())[0].worker_id if registry.workers else None,
        task_payload={
            "claim": "Sovereign AI workers enable autonomous research",
            "evidence_sources": ["docs/papers/"],
        },
    )
    
    orchestrator.add_step(
        workflow=workflow,
        step_id="generate",
        name="Generate Research Paper",
        worker_id=list(registry.workers.values())[0].worker_id if registry.workers else None,
        task_payload={
            "title": "Autonomous AI Workers for Research",
            "content": "A comprehensive study of sovereign AI workers...",
            "category": "architecture",
        },
        dependencies=["verify"],
    )
    
    print(f"Added {len(workflow.steps)} steps to workflow")
    
    # Execute workflow
    print(f"\nExecuting workflow at {datetime.utcnow().isoformat()}...")
    result = await orchestrator.execute_workflow(workflow)
    
    print(f"Workflow status: {result['status']}")
    print(f"Results:")
    for step_id, step_result in result['results'].items():
        print(f"  {step_id}: {step_result}")
    
    if result['errors']:
        print(f"Errors: {result['errors']}")
    
    # Stop workers
    for worker in registry.workers.values():
        await worker.stop()


async def example_4_monitoring_and_statistics():
    """
    Example 4: Worker monitoring and statistics collection.
    
    Demonstrates real-time monitoring of worker activity.
    """
    print("\n" + "="*80)
    print("Example 4: Monitoring and Statistics")
    print("="*80)
    
    # Create integrated system
    system = create_integrated_system()
    registry = system.get("worker_registry")
    
    if not registry:
        print("Worker registry not available")
        return
    
    # Create and start worker
    worker = registry.create_worker(
        name="MonitoredWorker",
        capabilities=["test"],
    )
    
    await worker.start()
    print(f"Started {worker.name}")
    
    # Submit multiple tasks
    from sovereign_workers import WorkerTask
    
    for i in range(5):
        task = WorkerTask(
            name=f"Task {i+1}",
            payload={"index": i},
        )
        await worker.execute_task(task)
    
    # Get detailed status
    status = worker.get_status()
    
    print(f"\nWorker Status Report:")
    print(f"  Worker ID: {status['worker_id']}")
    print(f"  Running: {status['running']}")
    print(f"  Runtime Clock:")
    print(f"    Uptime: {status['runtime_clock']['uptime_seconds']:.2f}s")
    print(f"    Ticks: {status['runtime_clock']['ticks']}")
    print(f"  Task Queue Size: {status['task_queue_size']}")
    print(f"  Active Tasks: {status['active_tasks']}")
    print(f"  Completed Tasks: {status['completed_tasks']}")
    print(f"\n  Statistics:")
    for key, value in status['statistics'].items():
        if isinstance(value, float):
            print(f"    {key}: {value:.2f}")
        else:
            print(f"    {key}: {value}")
    
    # List all workers
    print(f"\nAll Workers in Registry:")
    for w_info in registry.list_workers():
        print(f"  {w_info['worker_id']}: {w_info['name']}")
    
    await worker.stop()


async def example_5_capability_discovery():
    """
    Example 5: Worker capability discovery and composition.
    
    Demonstrates finding workers by capability.
    """
    print("\n" + "="*80)
    print("Example 5: Capability Discovery")
    print("="*80)
    
    # Create integrated system
    system = create_integrated_system()
    registry = system.get("worker_registry")
    
    if not registry:
        print("Worker registry not available")
        return
    
    # List all capabilities
    capabilities = registry.capability_registry.list_capabilities()
    print(f"Available Capabilities:")
    for cap in capabilities:
        print(f"  - {cap}")
    
    # Get capability details
    print(f"\nCapability Details:")
    for cap_name in capabilities[:3]:
        cap = registry.capability_registry.get(cap_name)
        if cap:
            print(f"\n  {cap_name}:")
            print(f"    Description: {cap.description}")
            print(f"    Requires Verification: {cap.requires_verification}")
            print(f"    Requires Governance: {cap.requires_governance}")


async def main():
    """Run all examples."""
    print("\n" + "="*80)
    print("SOVEREIGN AI WORKERS - INTEGRATION EXAMPLES")
    print("="*80)
    
    try:
        # Run examples
        await example_1_basic_worker_execution()
        await example_2_specialized_workers()
        await example_3_workflow_orchestration()
        await example_4_monitoring_and_statistics()
        await example_5_capability_discovery()
        
        print("\n" + "="*80)
        print("ALL EXAMPLES COMPLETED SUCCESSFULLY")
        print("="*80 + "\n")
    
    except Exception as e:
        print(f"\nError running examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
