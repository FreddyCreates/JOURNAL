"""
Tests for Sovereign AI Workers

Tests the autonomous worker framework, runtime clocks, task execution,
and multi-language interop.
"""

import pytest
import asyncio
from datetime import datetime

from sovereign_workers import (
    RuntimeClock,
    WorkerTask,
    TaskStatus,
    TaskPriority,
    SovereignWorker,
    SovereignWorkerRegistry,
    WorkerCapability,
    WorkerCapabilityRegistry,
)
from sovereign_workers.orchestrator import (
    Language,
    LanguageRuntime,
    WorkerOrchestrator,
    Workflow,
)


# ============================================================================
# Test Runtime Clock
# ============================================================================


class TestRuntimeClock:
    """Test RuntimeClock functionality."""
    
    def test_clock_creation(self):
        """Test creating a runtime clock."""
        clock = RuntimeClock(worker_id="test-worker")
        assert clock.worker_id == "test-worker"
        assert clock.ticks == 0
        assert not clock.paused
    
    def test_clock_tick(self):
        """Test advancing clock ticks."""
        clock = RuntimeClock(worker_id="test-worker")
        elapsed = clock.tick()
        
        assert clock.ticks == 1
        assert elapsed >= 0.0
    
    def test_clock_pause_resume(self):
        """Test pausing and resuming clock."""
        clock = RuntimeClock(worker_id="test-worker")
        
        clock.pause()
        assert clock.paused
        
        elapsed = clock.tick()
        assert elapsed == 0.0  # No time advances when paused
        
        clock.resume()
        assert not clock.paused
        
        elapsed = clock.tick()
        assert elapsed >= 0.0
    
    def test_uptime(self):
        """Test uptime calculation."""
        clock = RuntimeClock(worker_id="test-worker")
        uptime = clock.uptime_seconds
        assert uptime >= 0.0


# ============================================================================
# Test Worker Task
# ============================================================================


class TestWorkerTask:
    """Test WorkerTask functionality."""
    
    def test_task_creation(self):
        """Test creating a worker task."""
        task = WorkerTask(
            name="test-task",
            payload={"key": "value"},
        )
        
        assert task.name == "test-task"
        assert task.status == TaskStatus.PENDING
        assert task.payload == {"key": "value"}
    
    def test_task_status_transitions(self):
        """Test task status transitions."""
        task = WorkerTask(name="test-task")
        
        assert task.is_pending
        
        task.mark_started()
        assert task.is_running
        assert task.started_at is not None
        
        result = {"output": "test"}
        task.mark_completed(result)
        assert task.is_completed
        assert task.status == TaskStatus.COMPLETED
        assert task.result == result
    
    def test_task_failure(self):
        """Test task failure handling."""
        task = WorkerTask(name="test-task")
        
        task.mark_failed("Test error")
        assert task.is_completed
        assert task.status == TaskStatus.FAILED
        assert task.error == "Test error"
    
    def test_task_timeout(self):
        """Test task timeout."""
        task = WorkerTask(name="test-task", timeout_seconds=1.0)
        
        task.mark_timeout()
        assert task.is_completed
        assert task.status == TaskStatus.TIMEOUT


# ============================================================================
# Test Worker Capability Registry
# ============================================================================


class TestWorkerCapabilityRegistry:
    """Test capability registry."""
    
    def test_registry_creation(self):
        """Test creating capability registry."""
        registry = WorkerCapabilityRegistry()
        
        capabilities = registry.list_capabilities()
        assert "paper-generation" in capabilities
        assert "claim-verification" in capabilities
    
    def test_get_capability(self):
        """Test retrieving capability."""
        registry = WorkerCapabilityRegistry()
        
        cap = registry.get("paper-generation")
        assert cap is not None
        assert cap.name == "paper-generation"
    
    def test_register_custom_capability(self):
        """Test registering custom capability."""
        registry = WorkerCapabilityRegistry()
        
        custom_cap = WorkerCapability(
            name="custom-task",
            description="Custom capability",
        )
        
        registry.register(custom_cap)
        assert registry.get("custom-task") is not None


# ============================================================================
# Test Sovereign Worker
# ============================================================================


class TestSovereignWorker:
    """Test SovereignWorker functionality."""
    
    @pytest.mark.asyncio
    async def test_worker_creation(self):
        """Test creating a worker."""
        worker = SovereignWorker(
            name="TestWorker",
            capabilities=["test-capability"],
        )
        
        assert worker.name == "TestWorker"
        assert "test-capability" in worker.capabilities
        assert not worker._running
    
    @pytest.mark.asyncio
    async def test_worker_start_stop(self):
        """Test starting and stopping a worker."""
        worker = SovereignWorker(name="TestWorker")
        
        await worker.start()
        assert worker._running
        
        await asyncio.sleep(0.1)  # Let it run briefly
        
        await worker.stop()
        assert not worker._running
    
    @pytest.mark.asyncio
    async def test_worker_task_execution(self):
        """Test executing a task."""
        worker = SovereignWorker(name="TestWorker")
        await worker.start()
        
        task = WorkerTask(
            name="test-task",
            payload={"test": "data"},
        )
        
        result_task = await worker.execute_task(task)
        
        assert result_task.is_completed
        assert result_task.result is not None
        
        await worker.stop()
    
    @pytest.mark.asyncio
    async def test_worker_status(self):
        """Test getting worker status."""
        worker = SovereignWorker(name="TestWorker")
        
        status = worker.get_status()
        
        assert "worker_id" in status
        assert "running" in status
        assert "statistics" in status
        assert status["statistics"]["total_tasks"] == 0


# ============================================================================
# Test Worker Registry
# ============================================================================


class TestSovereignWorkerRegistry:
    """Test worker registry."""
    
    def test_registry_creation(self):
        """Test creating registry."""
        registry = SovereignWorkerRegistry()
        
        assert len(registry.workers) == 0
    
    def test_create_worker(self):
        """Test creating worker via registry."""
        registry = SovereignWorkerRegistry()
        
        worker = registry.create_worker(
            name="TestWorker",
            capabilities=["test-cap"],
        )
        
        assert worker is not None
        assert worker.name == "TestWorker"
        assert worker.worker_id in registry.workers
    
    def test_list_workers(self):
        """Test listing workers."""
        registry = SovereignWorkerRegistry()
        
        worker1 = registry.create_worker(name="Worker1")
        worker2 = registry.create_worker(name="Worker2")
        
        workers = registry.list_workers()
        assert len(workers) == 2
    
    def test_get_worker(self):
        """Test retrieving worker."""
        registry = SovereignWorkerRegistry()
        
        worker = registry.create_worker(name="TestWorker")
        retrieved = registry.get_worker(worker.worker_id)
        
        assert retrieved is not None
        assert retrieved.worker_id == worker.worker_id


# ============================================================================
# Test Language Runtimes
# ============================================================================


class TestLanguageRuntimes:
    """Test language runtime configurations."""
    
    def test_julia_runtime(self):
        """Test Julia runtime creation."""
        runtime = LanguageRuntime.julia()
        
        assert runtime.language == Language.JULIA
        assert runtime.executable == "julia"
    
    def test_rust_runtime(self):
        """Test Rust runtime creation."""
        runtime = LanguageRuntime.rust()
        
        assert runtime.language == Language.RUST
        assert runtime.executable == "cargo"
    
    def test_haskell_runtime(self):
        """Test Haskell runtime creation."""
        runtime = LanguageRuntime.haskell()
        
        assert runtime.language == Language.HASKELL
        assert runtime.executable == "runhaskell"
    
    def test_node_runtime(self):
        """Test Node.js runtime creation."""
        runtime = LanguageRuntime.node()
        
        assert runtime.language == Language.NODE
        assert runtime.executable == "node"


# ============================================================================
# Test Worker Orchestrator
# ============================================================================


class TestWorkerOrchestrator:
    """Test workflow orchestration."""
    
    @pytest.mark.asyncio
    async def test_orchestrator_creation(self):
        """Test creating orchestrator."""
        registry = SovereignWorkerRegistry()
        orchestrator = WorkerOrchestrator(worker_registry=registry)
        
        assert orchestrator.worker_registry is not None
    
    @pytest.mark.asyncio
    async def test_create_workflow(self):
        """Test creating a workflow."""
        registry = SovereignWorkerRegistry()
        orchestrator = WorkerOrchestrator(worker_registry=registry)
        
        workflow = await orchestrator.create_workflow(
            name="test-workflow",
            description="Test workflow",
        )
        
        assert workflow is not None
        assert workflow.name == "test-workflow"
        assert workflow.status == "pending"
    
    @pytest.mark.asyncio
    async def test_add_step(self):
        """Test adding steps to workflow."""
        registry = SovereignWorkerRegistry()
        orchestrator = WorkerOrchestrator(worker_registry=registry)
        
        workflow = await orchestrator.create_workflow(name="test-workflow")
        
        step = orchestrator.add_step(
            workflow=workflow,
            step_id="step-1",
            name="test-step",
        )
        
        assert step is not None
        assert len(workflow.steps) == 1
    
    @pytest.mark.asyncio
    async def test_execution_history(self):
        """Test execution history tracking."""
        registry = SovereignWorkerRegistry()
        orchestrator = WorkerOrchestrator(worker_registry=registry)
        
        history = orchestrator.get_execution_history()
        assert isinstance(history, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
