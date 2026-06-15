"""
Sovereign Organism — Integrated Python backend

Unified interface to all components.
"""

__version__ = "0.1.0"
__author__ = "Freddy Medina"
__license__ = "Proprietary"

__all__ = [
    "create_integrated_system",
]


def create_integrated_system():
    """
    Create a fully integrated Sovereign Organism system.
    
    Returns:
        Dict with all components initialized
    """
    
    # Import relative to the parent package
    from ..intelligence_router import IntelligenceRouter
    from ..governance_executor import GovernanceExecutor
    from ..memory_authority import MemoryVault
    from ..deployed_app import DeployedAppEngine, create_app
    from ..paper_engine import PaperSynthesizer
    from ..ai_tools import AIToolRegistry, MemoryTokenSystem
    from ..cross_domain_uses import CrossDomainWorkflow, DeploymentManager
    
    # Import sovereign workers
    try:
        from ..sovereign_workers import SovereignWorkerRegistry
        from ..sovereign_workers.orchestrator import WorkerOrchestrator
        from ..sovereign_workers.specialized import (
            AUROWorker,
            THESISWorker,
            CIVOSWorker,
            SENTINELWorker,
        )
    except ImportError:
        SovereignWorkerRegistry = None
        WorkerOrchestrator = None
        AUROWorker = None
        THESISWorker = None
        CIVOSWorker = None
        SENTINELWorker = None
    
    # Initialize core components
    vault = MemoryVault(cache_size=1000)
    executor = GovernanceExecutor()
    router = IntelligenceRouter()
    synthesizer = PaperSynthesizer()
    tool_registry = AIToolRegistry()
    token_system = MemoryTokenSystem()
    
    workflow = CrossDomainWorkflow(
        memory_vault=vault,
        governance_executor=executor,
    )
    
    deployment = DeploymentManager()
    
    # Initialize worker system
    worker_registry = None
    worker_orchestrator = None
    specialized_workers = {}
    
    if SovereignWorkerRegistry:
        worker_registry = SovereignWorkerRegistry(
            intelligence_router=router,
            memory_vault=vault,
            governance_executor=executor,
        )
        
        worker_orchestrator = WorkerOrchestrator(
            worker_registry=worker_registry,
            memory_vault=vault,
            governance_executor=executor,
            cross_domain_workflow=workflow,
        )
        
        # Create specialized workers
        if AUROWorker:
            auro = AUROWorker(
                paper_synthesizer=synthesizer,
                governance_executor=executor,
                memory_vault=vault,
                intelligence_router=router,
            )
            worker_registry.register_worker(auro)
            specialized_workers["AURO"] = auro
        
        if THESISWorker:
            thesis = THESISWorker(
                cross_domain_workflow=workflow,
                memory_vault=vault,
                intelligence_router=router,
            )
            worker_registry.register_worker(thesis)
            specialized_workers["THESIS"] = thesis
        
        if CIVOSWorker:
            civos = CIVOSWorker(
                governance_executor=executor,
                memory_vault=vault,
                intelligence_router=router,
            )
            worker_registry.register_worker(civos)
            specialized_workers["CIVOS"] = civos
        
        if SENTINELWorker:
            sentinel = SENTINELWorker(
                memory_vault=vault,
                intelligence_router=router,
            )
            worker_registry.register_worker(sentinel)
            specialized_workers["SENTINEL"] = sentinel
    
    return {
        "memory_vault": vault,
        "governance_executor": executor,
        "intelligence_router": router,
        "paper_synthesizer": synthesizer,
        "tool_registry": tool_registry,
        "memory_token_system": token_system,
        "workflow": workflow,
        "deployment": deployment,
        "worker_registry": worker_registry,
        "worker_orchestrator": worker_orchestrator,
        "specialized_workers": specialized_workers,
    }
