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
    
    return {
        "memory_vault": vault,
        "governance_executor": executor,
        "intelligence_router": router,
        "paper_synthesizer": synthesizer,
        "tool_registry": tool_registry,
        "memory_token_system": token_system,
        "workflow": workflow,
        "deployment": deployment,
    }
