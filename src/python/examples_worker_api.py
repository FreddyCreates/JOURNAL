"""
Sovereign AI Workers - FastAPI Quick Start Guide

This guide demonstrates how to use the worker management endpoints
via the FastAPI API.
"""

import json
import requests
from typing import Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000"
API_ENDPOINTS = {
    "create_worker": f"{API_BASE_URL}/api/workers",
    "list_workers": f"{API_BASE_URL}/api/workers",
    "get_worker_status": lambda wid: f"{API_BASE_URL}/api/workers/{wid}",
    "start_worker": lambda wid: f"{API_BASE_URL}/api/workers/{wid}/start",
    "stop_worker": lambda wid: f"{API_BASE_URL}/api/workers/{wid}/stop",
    "submit_task": lambda wid: f"{API_BASE_URL}/api/workers/{wid}/tasks",
    "list_capabilities": f"{API_BASE_URL}/api/workers/capabilities",
    "create_workflow": f"{API_BASE_URL}/api/workflows",
}


def pretty_print(title: str, data: Dict[str, Any]):
    """Pretty print JSON data."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(json.dumps(data, indent=2))


# ============================================================================
# 1. WORKER MANAGEMENT
# ============================================================================


def create_worker(name: str, description: str = "", capabilities: list = None) -> Dict:
    """Create a new worker."""
    payload = {
        "name": name,
        "description": description,
        "capabilities": capabilities or [],
    }
    
    response = requests.post(API_ENDPOINTS["create_worker"], json=payload)
    return response.json()


def list_workers() -> Dict:
    """List all workers."""
    response = requests.get(API_ENDPOINTS["list_workers"])
    return response.json()


def get_worker_status(worker_id: str) -> Dict:
    """Get status of a specific worker."""
    url = API_ENDPOINTS["get_worker_status"](worker_id)
    response = requests.get(url)
    return response.json()


def start_worker(worker_id: str) -> Dict:
    """Start a worker."""
    url = API_ENDPOINTS["start_worker"](worker_id)
    response = requests.post(url)
    return response.json()


def stop_worker(worker_id: str) -> Dict:
    """Stop a worker."""
    url = API_ENDPOINTS["stop_worker"](worker_id)
    response = requests.post(url)
    return response.json()


# ============================================================================
# 2. TASK EXECUTION
# ============================================================================


def submit_task(
    worker_id: str,
    name: str,
    payload: Dict[str, Any],
    description: str = "",
    timeout_seconds: float = 300.0,
) -> Dict:
    """Submit a task to a worker."""
    url = API_ENDPOINTS["submit_task"](worker_id)
    
    task_payload = {
        "name": name,
        "description": description,
        "payload": payload,
        "timeout_seconds": timeout_seconds,
    }
    
    response = requests.post(url, json=task_payload)
    return response.json()


# ============================================================================
# 3. WORKFLOW ORCHESTRATION
# ============================================================================


def create_workflow(
    name: str,
    steps: list,
    parallel: bool = False,
) -> Dict:
    """Create and execute a workflow."""
    payload = {
        "name": name,
        "steps": steps,
        "parallel": parallel,
    }
    
    response = requests.post(API_ENDPOINTS["create_workflow"], json=payload)
    return response.json()


def list_capabilities() -> Dict:
    """List all available capabilities."""
    response = requests.get(API_ENDPOINTS["list_capabilities"])
    return response.json()


# ============================================================================
# EXAMPLES
# ============================================================================


def example_1_basic_worker_lifecycle():
    """Example 1: Create, start, execute task, and stop worker."""
    print("\n" + "="*60)
    print("Example 1: Basic Worker Lifecycle")
    print("="*60)
    
    # Create worker
    print("\n1. Creating worker...")
    worker_data = create_worker(
        name="PaperGen",
        description="Paper generation worker",
        capabilities=["paper-generation"]
    )
    worker_id = worker_data["worker_id"]
    pretty_print("Created Worker", worker_data)
    
    # Start worker
    print("\n2. Starting worker...")
    start_data = start_worker(worker_id)
    pretty_print("Worker Started", start_data)
    
    # Get status
    print("\n3. Getting worker status...")
    status = get_worker_status(worker_id)
    pretty_print("Worker Status", status)
    
    # Submit task
    print("\n4. Submitting task...")
    task_result = submit_task(
        worker_id=worker_id,
        name="Generate Architecture Paper",
        description="Generate a paper on sovereign architecture",
        payload={
            "title": "Sovereign Architecture",
            "content": "A comprehensive guide to building sovereign systems...",
            "category": "architecture",
        }
    )
    pretty_print("Task Result", task_result)
    
    # Stop worker
    print("\n5. Stopping worker...")
    stop_data = stop_worker(worker_id)
    pretty_print("Worker Stopped", stop_data)


def example_2_list_and_discover():
    """Example 2: List workers and discover capabilities."""
    print("\n" + "="*60)
    print("Example 2: Discovery")
    print("="*60)
    
    # List workers
    print("\n1. Listing all workers...")
    workers_data = list_workers()
    pretty_print("All Workers", workers_data)
    
    # List capabilities
    print("\n2. Listing available capabilities...")
    caps_data = list_capabilities()
    pretty_print("Available Capabilities", caps_data)


def example_3_workflow_with_dependencies():
    """Example 3: Create workflow with task dependencies."""
    print("\n" + "="*60)
    print("Example 3: Workflow with Dependencies")
    print("="*60)
    
    # First create workers
    print("\n1. Creating workers for workflow...")
    thesis_worker = create_worker(
        name="THESIS",
        description="Claim verification",
        capabilities=["claim-verification"]
    )
    auro_worker = create_worker(
        name="AURO",
        description="Paper generation",
        capabilities=["paper-generation"]
    )
    
    thesis_id = thesis_worker["worker_id"]
    auro_id = auro_worker["worker_id"]
    
    print(f"THESIS Worker: {thesis_id}")
    print(f"AURO Worker: {auro_id}")
    
    # Create workflow with dependencies
    print("\n2. Creating workflow with dependencies...")
    workflow_result = create_workflow(
        name="Verify and Publish",
        parallel=False,
        steps=[
            {
                "step_id": "verify",
                "name": "Verify Claims",
                "worker_id": thesis_id,
                "payload": {
                    "claim": "Sovereign architecture enables autonomous AI workers",
                    "evidence_sources": ["docs/papers/"],
                }
            },
            {
                "step_id": "publish",
                "name": "Publish Paper",
                "worker_id": auro_id,
                "payload": {
                    "title": "Autonomous AI Workers",
                    "content": "Study on sovereign AI workers...",
                    "category": "architecture",
                },
                "dependencies": ["verify"],
            }
        ]
    )
    
    pretty_print("Workflow Result", workflow_result)


def example_4_parallel_tasks():
    """Example 4: Execute tasks in parallel."""
    print("\n" + "="*60)
    print("Example 4: Parallel Task Execution")
    print("="*60)
    
    # Create multiple workers
    print("\n1. Creating workers...")
    workers = []
    for i in range(3):
        worker = create_worker(
            name=f"Worker{i+1}",
            description=f"Worker for parallel execution {i+1}"
        )
        workers.append(worker)
        print(f"Created: {worker['worker_id']}")
    
    # Submit tasks to each worker in parallel
    print("\n2. Submitting parallel tasks...")
    tasks = []
    for i, worker in enumerate(workers):
        task = submit_task(
            worker_id=worker["worker_id"],
            name=f"Task {i+1}",
            payload={"data": f"Task payload {i+1}"}
        )
        tasks.append(task)
    
    pretty_print("Parallel Tasks Result", {"tasks_submitted": len(tasks)})
    for i, task in enumerate(tasks):
        print(f"  Task {i+1}: {task['task_id']}")


def example_5_monitoring():
    """Example 5: Monitor worker activity."""
    print("\n" + "="*60)
    print("Example 5: Worker Monitoring")
    print("="*60)
    
    # Create and monitor worker
    print("\n1. Creating worker...")
    worker = create_worker(
        name="MonitoredWorker",
        description="Worker for monitoring"
    )
    worker_id = worker["worker_id"]
    
    print("\n2. Starting worker...")
    start_worker(worker_id)
    
    print("\n3. Submitting multiple tasks...")
    for i in range(5):
        submit_task(
            worker_id=worker_id,
            name=f"Task {i+1}",
            payload={"iteration": i}
        )
    
    print("\n4. Checking worker statistics...")
    status = get_worker_status(worker_id)
    
    stats = status.get("statistics", {})
    print(f"  Total Tasks: {stats.get('total_tasks', 0)}")
    print(f"  Completed: {stats.get('completed_tasks', 0)}")
    print(f"  Failed: {stats.get('failed_tasks', 0)}")
    print(f"  Average Time: {stats.get('average_execution_time', 0):.2f}s")
    
    print("\n5. Stopping worker...")
    stop_worker(worker_id)


# ============================================================================
# MAIN
# ============================================================================


def main():
    """Run all examples."""
    print("\n" + "="*60)
    print("SOVEREIGN AI WORKERS - FASTAPI QUICK START")
    print("="*60)
    print(f"API Base URL: {API_BASE_URL}")
    
    try:
        # Check if API is running
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code != 200:
            print("\n⚠️  API is not responding. Make sure to start the FastAPI server:")
            print("   python src/python/deployed-app/__init__.py")
            print("   or")
            print("   uvicorn src.python.deployed_app:create_app --reload")
            return
        
        print("✓ API is running\n")
        
        # Run examples
        example_1_basic_worker_lifecycle()
        example_2_list_and_discover()
        example_3_workflow_with_dependencies()
        example_4_parallel_tasks()
        example_5_monitoring()
        
        print("\n" + "="*60)
        print("ALL EXAMPLES COMPLETED")
        print("="*60 + "\n")
    
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to API at", API_BASE_URL)
        print("Please start the FastAPI server first:")
        print("   uvicorn src.python.deployed_app:create_app --reload --port 8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    main()
