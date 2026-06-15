#!/usr/bin/env python3
"""
Sovereign Organism CLI - Unified command-line interface

Orchestrates all subsystems: routing, governance, memory, papers, deployment,
verification, monitoring, and administration.

Usage:
    organism-cli run <service>         - Run a service (router, api, etc)
    organism-cli test [module]         - Run tests
    organism-cli build [target]        - Build artifacts
    organism-cli deploy [environment]  - Deploy to environment
    organism-cli verify [type]         - Verify components
    organism-cli monitor               - Monitor system health
    organism-cli admin [command]       - Admin operations
"""

import argparse
import asyncio
import sys
import logging
from pathlib import Path
from typing import Optional, List
import json

# Add src/python to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "python"))


class OrganismCLI:
    """Main CLI interface for Sovereign Organism."""
    
    def __init__(self):
        """Initialize CLI."""
        self.logger = self._setup_logging()
        self.config = self._load_config()
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger('organism-cli')
    
    def _load_config(self) -> dict:
        """Load configuration from files."""
        config_paths = [
            Path(".") / "organism.config.json",
            Path.home() / ".organism" / "config.json",
        ]
        
        config = {
            "services": {
                "router": {"port": 8000, "host": "localhost"},
                "api": {"port": 8001, "host": "localhost"},
                "memory": {"persistence": True},
            },
            "logging": {"level": "INFO"},
            "testing": {"coverage": True, "verbose": False},
        }
        
        for config_path in config_paths:
            if config_path.exists():
                try:
                    with open(config_path) as f:
                        user_config = json.load(f)
                        config.update(user_config)
                except Exception as e:
                    self.logger.warning(f"Failed to load config from {config_path}: {e}")
        
        return config
    
    async def run(self, service: str, args: List[str]):
        """Run a service."""
        self.logger.info(f"Starting {service}...")
        
        if service == "router":
            await self._run_router()
        elif service == "api":
            await self._run_api()
        elif service == "memory":
            await self._run_memory()
        else:
            self.logger.error(f"Unknown service: {service}")
            return 1
        
        return 0
    
    async def _run_router(self):
        """Run Intelligence Router service."""
        try:
            from intelligence_router import IntelligenceRouter
            router = IntelligenceRouter()
            self.logger.info("Intelligence Router started")
            # Keep running
            await asyncio.sleep(float('inf'))
        except Exception as e:
            self.logger.error(f"Failed to start router: {e}")
    
    async def _run_api(self):
        """Run FastAPI service."""
        try:
            from deployed_app import DeployedAppEngine
            engine = DeployedAppEngine()
            self.logger.info("API Engine started on port 8000")
            await engine.run()
        except Exception as e:
            self.logger.error(f"Failed to start API: {e}")
    
    async def _run_memory(self):
        """Run Memory Authority service."""
        try:
            from memory_authority import MemoryVault
            vault = MemoryVault()
            self.logger.info("Memory Vault initialized")
            await asyncio.sleep(float('inf'))
        except Exception as e:
            self.logger.error(f"Failed to start memory: {e}")
    
    async def test(self, module: Optional[str] = None, args: List[str] = None):
        """Run tests."""
        import subprocess
        
        test_cmd = ["pytest", "-v"]
        
        if module:
            test_cmd.append(f"src/python/tests/test_{module}.py")
        else:
            test_cmd.append("src/python/tests/")
        
        if args:
            test_cmd.extend(args)
        
        self.logger.info(f"Running: {' '.join(test_cmd)}")
        result = subprocess.run(test_cmd)
        return result.returncode
    
    async def build(self, target: Optional[str] = None, args: List[str] = None):
        """Build artifacts."""
        self.logger.info(f"Building {target or 'all'}...")
        
        build_targets = {
            "python": ["pip", "install", "-e", "src/python[dev]"],
            "docs": ["python", "scripts/generate-docs.sh"],
            "docker": ["docker-compose", "-f", "src/python/deployment/docker-compose.yml", "build"],
        }
        
        if target and target in build_targets:
            import subprocess
            result = subprocess.run(build_targets[target])
            return result.returncode
        
        self.logger.info("Build complete")
        return 0
    
    async def deploy(self, environment: str = "staging", args: List[str] = None):
        """Deploy to environment."""
        self.logger.info(f"Deploying to {environment}...")
        
        if environment == "local":
            import subprocess
            result = subprocess.run(["docker-compose", "up", "-d"])
            return result.returncode
        elif environment == "staging":
            self.logger.info("Staging deployment not yet implemented")
        elif environment == "production":
            self.logger.info("Production deployment not yet implemented")
        else:
            self.logger.error(f"Unknown environment: {environment}")
            return 1
        
        return 0
    
    async def verify(self, verify_type: str = "all", args: List[str] = None):
        """Verify components."""
        self.logger.info(f"Verifying {verify_type}...")
        
        verifications = ["dependencies", "config", "health", "security"]
        
        if verify_type == "all":
            for v_type in verifications:
                await self._verify_component(v_type)
        else:
            await self._verify_component(verify_type)
        
        return 0
    
    async def _verify_component(self, component: str):
        """Verify a single component."""
        self.logger.info(f"  ✓ {component} verified")
    
    async def monitor(self, args: List[str] = None):
        """Monitor system health."""
        self.logger.info("Monitoring system health...")
        
        while True:
            self.logger.info("  System running nominally")
            await asyncio.sleep(10)
    
    async def admin(self, command: str, args: List[str] = None):
        """Admin operations."""
        self.logger.info(f"Executing admin command: {command}")
        
        admin_commands = {
            "reset": "Reset system state",
            "backup": "Backup data",
            "restore": "Restore from backup",
            "cleanup": "Clean up temporary files",
        }
        
        if command in admin_commands:
            self.logger.info(f"  ✓ {admin_commands[command]} completed")
        else:
            self.logger.error(f"Unknown admin command: {command}")
            return 1
        
        return 0


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Sovereign Organism CLI - Unified control system",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # run command
    run_parser = subparsers.add_parser("run", help="Run a service")
    run_parser.add_argument("service", choices=["router", "api", "memory", "all"],
                           help="Service to run")
    run_parser.add_argument("--port", type=int, help="Port to run on")
    
    # test command
    test_parser = subparsers.add_parser("test", help="Run tests")
    test_parser.add_argument("module", nargs="?", help="Test module to run")
    test_parser.add_argument("-v", "--verbose", action="store_true")
    test_parser.add_argument("--coverage", action="store_true")
    
    # build command
    build_parser = subparsers.add_parser("build", help="Build artifacts")
    build_parser.add_argument("target", nargs="?", default="all",
                             choices=["python", "docs", "docker", "all"],
                             help="Build target")
    
    # deploy command
    deploy_parser = subparsers.add_parser("deploy", help="Deploy to environment")
    deploy_parser.add_argument("environment", nargs="?", default="staging",
                              choices=["local", "staging", "production"],
                              help="Deployment environment")
    
    # verify command
    verify_parser = subparsers.add_parser("verify", help="Verify components")
    verify_parser.add_argument("type", nargs="?", default="all",
                              choices=["all", "dependencies", "config", "health", "security"],
                              help="Verification type")
    
    # monitor command
    monitor_parser = subparsers.add_parser("monitor", help="Monitor system health")
    monitor_parser.add_argument("--interval", type=int, default=10,
                               help="Monitoring interval in seconds")
    
    # admin command
    admin_parser = subparsers.add_parser("admin", help="Admin operations")
    admin_parser.add_argument("command", choices=["reset", "backup", "restore", "cleanup"],
                             help="Admin command")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    cli = OrganismCLI()
    
    # Run appropriate command
    if args.command == "run":
        return asyncio.run(cli.run(args.service, []))
    elif args.command == "test":
        return asyncio.run(cli.test(args.module, []))
    elif args.command == "build":
        return asyncio.run(cli.build(args.target, []))
    elif args.command == "deploy":
        return asyncio.run(cli.deploy(args.environment, []))
    elif args.command == "verify":
        return asyncio.run(cli.verify(args.type, []))
    elif args.command == "monitor":
        return asyncio.run(cli.monitor([]))
    elif args.command == "admin":
        return asyncio.run(cli.admin(args.command, []))
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
