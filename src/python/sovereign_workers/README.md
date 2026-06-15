# Sovereign AI Workers Framework

## Overview

The Sovereign AI Workers framework implements autonomous, self-managing AI agents with their own independent runtime clocks and execution contexts. These workers operate autonomously, managing task queues, integrating with the Memory Vault, Intelligence Router, and other system components.

## Core Architecture

### 1. Runtime Clock System

Each worker has an internal **RuntimeClock** that tracks:
- Execution cycles (ticks)
- Uptime and elapsed time
- Pause/resume state
- Drift correction

```python
from sovereign_workers import RuntimeClock

clock = RuntimeClock(worker_id="AURO-001")
clock.tick()  # Advance one cycle
uptime = clock.uptime_seconds  # Get uptime
```

### 2. Task Execution System

Workers process **WorkerTask** instances from an async queue:

```python
from sovereign_workers import WorkerTask, SovereignWorker

task = WorkerTask(
    name="Generate Paper",
    payload={"title": "...", "content": "..."},
    timeout_seconds=300.0,
    priority=TaskPriority.NORMAL,
)

worker = SovereignWorker(name="AURO")
result = await worker.execute_task(task)
```

### 3. Capability Registry

Workers declare their capabilities for discovery and composition:

```python
from sovereign_workers import WorkerCapabilityRegistry

registry = WorkerCapabilityRegistry()
capabilities = registry.list_capabilities()  # All registered capabilities
cap = registry.get("paper-generation")  # Get specific capability
```

### 4. Worker Orchestration

The **WorkerOrchestrator** chains tasks across workers and supports multi-language execution:

```python
from sovereign_workers.orchestrator import WorkerOrchestrator, Language

orchestrator = WorkerOrchestrator(worker_registry=registry)

# Create workflow
workflow = await orchestrator.create_workflow("verify-and-publish")

# Add steps
orchestrator.add_step(
    workflow=workflow,
    step_id="verify",
    name="Verify Claims",
    worker_id="THESIS-001",
    task_payload={"claim": "..."},
)

orchestrator.add_step(
    workflow=workflow,
    step_id="publish",
    name="Publish Paper",
    worker_id="AURO-001",
    task_payload={"paper": "..."},
    dependencies=["verify"],
)

# Execute
result = await orchestrator.execute_workflow(workflow)
```

## Specialized Workers

### AURO: Paper Generator

Generates research papers from claims and evidence.

**Capabilities:**
- `paper-generation` - Generate HTML papers
- `claim-verification` - Extract and verify claims

**Task Payload:**
```json
{
  "title": "Paper Title",
  "content": "Markdown content...",
  "category": "architecture|protocols|quantum|defense|cognitive"
}
```

**Response:**
```json
{
  "status": "completed",
  "paper_id": "paper-abc123",
  "title": "Paper Title",
  "category": "architecture"
}
```

### THESIS: Claim Verification

Verifies research claims against evidence using Julia integration.

**Capabilities:**
- `claim-verification` - Verify claims
- `evidence-mapping` - Map evidence to claims

**Task Payload:**
```json
{
  "claim": "Architecture is sovereign",
  "evidence_sources": ["docs/papers/...", "docs/journals/..."],
  "publish": false
}
```

**Response:**
```json
{
  "status": "verified",
  "verification_id": "verify-abc123",
  "claim": "Architecture is sovereign",
  "confidence": 0.95,
  "evidence_count": 3
}
```

### CIVOS: Governance Enforcement

Enforces constitutional laws and governance policies.

**Capabilities:**
- `governance-enforcement` - Enforce CPL-L laws
- `law-validation` - Validate law compliance

**Task Payload:**
```json
{
  "law_name": "sovereign-vault",
  "context": {
    "action": "access_vault",
    "actor": "AURO-001"
  }
}
```

**Response:**
```json
{
  "status": "enforced",
  "law_name": "sovereign-vault",
  "approved": true
}
```

### SENTINEL: Memory & Security

Manages memory indexing and detects security threats.

**Capabilities:**
- `threat-detection` - Detect security issues
- `memory-indexing` - Index in vault
- `security-monitoring` - Monitor security

**Task Payload (Index Memory):**
```json
{
  "operation": "index-memory",
  "content": "Memory content...",
  "tags": ["execution", "paper-generation"]
}
```

**Task Payload (Detect Threats):**
```json
{
  "operation": "detect-threats",
  "content": "Code or content to scan..."
}
```

## Multi-Language Support

Workers can execute code in multiple languages via subprocess:

```python
from sovereign_workers.orchestrator import Language, LanguageExecutor, LanguageRuntime

# Julia execution
julia_runtime = LanguageRuntime.julia()
julia_executor = LanguageExecutor(julia_runtime)
result = await julia_executor.execute(
    code_or_script="",
    input_data={"claim": "..."}
)

# Rust execution
rust_runtime = LanguageRuntime.rust()
rust_executor = LanguageExecutor(rust_runtime)
result = await rust_executor.execute("", input_data={})

# Haskell execution
haskell_runtime = LanguageRuntime.haskell()
haskell_executor = LanguageExecutor(haskell_runtime)
result = await haskell_executor.execute("", input_data={})

# Node.js execution
node_runtime = LanguageRuntime.node()
node_executor = LanguageExecutor(node_runtime)
result = await node_executor.execute("", input_data={})
```

## FastAPI Integration

New worker management endpoints are available in the deployed app:

### Worker Management

**Create Worker:**
```bash
POST /api/workers
{
  "name": "AURO-Paper-Gen",
  "description": "Paper generation worker",
  "capabilities": ["paper-generation", "claim-verification"]
}
```

**List Workers:**
```bash
GET /api/workers
```

**Get Worker Status:**
```bash
GET /api/workers/{worker_id}
```

**Start Worker:**
```bash
POST /api/workers/{worker_id}/start
```

**Stop Worker:**
```bash
POST /api/workers/{worker_id}/stop
```

### Task Execution

**Submit Task:**
```bash
POST /api/workers/{worker_id}/tasks
{
  "name": "Generate Paper",
  "description": "Generate architecture paper",
  "payload": {
    "title": "Sovereign Architecture",
    "content": "...",
    "category": "architecture"
  },
  "timeout_seconds": 300.0
}
```

### Workflow Orchestration

**Execute Workflow:**
```bash
POST /api/workflows
{
  "name": "verify-and-publish",
  "parallel": false,
  "steps": [
    {
      "step_id": "verify",
      "name": "Verify Claims",
      "worker_id": "THESIS-001",
      "payload": {"claim": "..."}
    },
    {
      "step_id": "publish",
      "name": "Publish Paper",
      "worker_id": "AURO-001",
      "payload": {"paper": "..."},
      "dependencies": ["verify"]
    }
  ]
}
```

## System Integration

### With Memory Vault

Workers automatically store execution results and memories:

```python
# Automatically called during task execution
memory = await worker.store_memory(
    content="Executed task X with result Y",
    tags=["execution", "paper-generation"]
)
```

### With Intelligence Router

Workers can route tasks through multiple AI models:

```python
# In _execute_task_impl, can call:
result = await self.intelligence_router.route_query(
    query="Verify architectural claims",
    models=["gpt-4", "claude-3-opus"],
)
```

### With Governance Executor

Workers enforce constitutional laws:

```python
# Enforce CPL-L laws before actions
enforcement = await self.governance_executor.enforce_law(
    law_name="sovereign-vault",
    context={"action": "access_vault"}
)
```

### With THESIS

Workers can call Julia verification:

```python
# Cross-domain workflow includes THESIS verification
result = await self.cross_domain_workflow.end_to_end_verification(
    claim="Architecture is sovereign",
    evidence_sources=["docs/papers/..."],
    publish=True
)
```

## Lifecycle Management

### Starting Workers

```python
# Start individual worker
await worker.start()

# Start all workers in registry
await registry.start_all()
```

### Stopping Workers

```python
# Stop individual worker
await worker.stop()

# Stop all workers in registry
await registry.stop_all()
```

### Monitoring

```python
# Get worker status
status = worker.get_status()
print(status)
# {
#   "worker_id": "AURO-001",
#   "running": true,
#   "runtime_clock": {"uptime_seconds": 45.2, "ticks": 452},
#   "statistics": {
#     "total_tasks": 10,
#     "completed_tasks": 9,
#     "failed_tasks": 1,
#     "average_execution_time": 2.3
#   }
# }
```

## Real-World Example

Complete workflow: verify claims, generate paper, enforce governance, publish:

```python
import asyncio
from sovereign_workers import SovereignWorkerRegistry
from sovereign_workers.orchestrator import WorkerOrchestrator

async def main():
    # Initialize systems
    registry = SovereignWorkerRegistry()
    orchestrator = WorkerOrchestrator(worker_registry=registry)
    
    # Create specialized workers
    thesis_worker = registry.create_worker(
        name="THESIS",
        capabilities=["claim-verification"]
    )
    auro_worker = registry.create_worker(
        name="AURO",
        capabilities=["paper-generation"]
    )
    
    # Start workers
    await thesis_worker.start()
    await auro_worker.start()
    
    # Create and execute workflow
    workflow = await orchestrator.create_workflow(
        name="Verify and Publish",
        parallel=False
    )
    
    orchestrator.add_step(
        workflow=workflow,
        step_id="verify",
        name="Verify Claims",
        worker_id=thesis_worker.worker_id,
        task_payload={
            "claim": "Sovereign architecture is feasible",
            "evidence_sources": ["docs/papers/architecture/"]
        }
    )
    
    orchestrator.add_step(
        workflow=workflow,
        step_id="generate",
        name="Generate Paper",
        worker_id=auro_worker.worker_id,
        task_payload={
            "title": "Sovereign Architecture",
            "content": "...",
            "category": "architecture"
        },
        dependencies=["verify"]
    )
    
    result = await orchestrator.execute_workflow(workflow)
    print(f"Workflow result: {result}")
    
    # Cleanup
    await thesis_worker.stop()
    await auro_worker.stop()

if __name__ == "__main__":
    asyncio.run(main())
```

## Performance Considerations

### Task Timeout
- Default: 300 seconds
- Configurable per task
- Triggered with `TaskStatus.TIMEOUT`

### Runtime Clock Frequency
- Tasks execute at 1 Hz by default
- Can be tuned per worker
- Tracks drift for precision

### Memory Management
- Task queue limits prevent unbounded growth
- Completed tasks stored in worker history
- Memory vault integration for persistent storage

### Parallel Execution
- Workflows can execute steps in parallel
- Dependencies enforced automatically
- Resource contention handled by asyncio

## Extension Points

### Custom Workers

```python
from sovereign_workers import SovereignWorker, WorkerTask

class CustomWorker(SovereignWorker):
    async def _execute_task_impl(self, task: WorkerTask):
        task.mark_started()
        
        # Custom implementation
        result = do_work(task.payload)
        
        task.mark_completed(result)
        return result
```

### Custom Capabilities

```python
from sovereign_workers import WorkerCapabilityRegistry, WorkerCapability

registry = WorkerCapabilityRegistry()
registry.register(WorkerCapability(
    name="custom-capability",
    description="My custom capability",
    input_schema={...},
    output_schema={...}
))
```

### Language Integration

```python
from sovereign_workers.orchestrator import LanguageRuntime, LanguageExecutor

# Add custom language
custom_runtime = LanguageRuntime(
    language="custom",
    executable="my-executable",
    entrypoint="my-script.custom"
)
executor = LanguageExecutor(custom_runtime)
result = await executor.execute("", input_data={})
```

## Testing

Run the test suite:

```bash
pytest src/python/tests/test_sovereign_workers.py -v
```

Key test areas:
- Runtime clock functionality
- Task status transitions
- Worker lifecycle (start/stop)
- Task execution
- Workflow orchestration
- Language execution
- Registry operations

## Future Enhancements

1. **Distributed Execution**: Execute workers across multiple machines
2. **GPU Support**: Leverage GPU for compute-heavy tasks
3. **Persistent State**: Checkpoint worker state for recovery
4. **Advanced Scheduling**: Priority queues, load balancing
5. **Monitoring Dashboard**: Real-time worker status visualization
6. **Advanced Metrics**: Prometheus integration, detailed profiling
7. **Worker Communication**: Direct inter-worker messaging
8. **Plugin System**: Dynamic worker and capability loading

## API Reference

See `src/python/sovereign-workers/__init__.py` for complete API documentation.
