#!/usr/bin/env python3
"""
SyncBoard CLI - Command-line interface for AI agents to interact with the Kanban board.

Usage:
    syncboard list [--board <id>] [--status <status>] [--source human|ai]
    syncboard get <card-id>
    syncboard create --title "Task title" [--description "..."] [--board <id>]
    syncboard claim <card-id> --agent <agent-id>
    syncboard status <card-id> --status <running|completed|failed>
    syncboard move <card-id> --column <column-id>
    syncboard comment <card-id> --message "Comment text"
    syncboard log <card-id> --type <info|success|error> --message "Log message"
    syncboard poll [--since <timestamp>]
    syncboard files [--scope project|task] [--card <card-id>]
    syncboard file-get <file-id>
    syncboard file-create --name <name> --type <markdown|json> --content <content>
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Optional
import requests

# Default API URL - can be overridden with SYNCBOARD_API_URL env var
API_URL = os.environ.get("SYNCBOARD_API_URL", "http://localhost:8001/api")

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'


def print_card(card: dict, verbose: bool = False):
    """Pretty print a card"""
    source_color = Colors.CYAN if card.get("source") == "human" else Colors.YELLOW
    source_icon = "👤" if card.get("source") == "human" else "🤖"
    
    print(f"\n{Colors.BOLD}#{card['number']}{Colors.END} {card['title']}")
    print(f"  {source_icon} {source_color}{card.get('source', 'unknown').upper()}{Colors.END}")
    print(f"  📍 Column: {card.get('column_id', 'N/A')}")
    print(f"  🏷️  Tags: {', '.join(card.get('tags', []))}")
    
    if card.get("assignee_id"):
        print(f"  👤 Assignee: {card['assignee_id']}")
    
    print(f"  📅 Version: {card.get('version', 1)}")
    
    if verbose and card.get("description"):
        print(f"\n  📝 Description:\n  {card['description']}")


def print_file(file: dict):
    """Pretty print a file"""
    type_icons = {
        "markdown": "📝",
        "json": "📋",
        "image": "🖼️",
        "code": "💻"
    }
    icon = type_icons.get(file.get("type"), "📄")
    
    print(f"\n{icon} {Colors.BOLD}{file['name']}{Colors.END}")
    print(f"  📦 Size: {file.get('size', 0) / 1024:.1f} KB")
    print(f"  🏷️  Scope: {file.get('scope', 'project')}")
    if file.get("linked_cards"):
        print(f"  🔗 Linked to: {', '.join(file['linked_cards'])}")


def cmd_list(args):
    """List cards"""
    params = {}
    if args.board:
        params["board_id"] = args.board
    if args.source:
        params["source"] = args.source
    
    url = f"{API_URL}/boards/{args.board or 'board-1'}/cards"
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    cards = response.json()
    print(f"\n{Colors.BOLD}📋 Cards ({len(cards)} total){Colors.END}")
    print("-" * 50)
    
    for card in cards:
        print_card(card)
    
    return 0


def cmd_get(args):
    """Get a specific card"""
    url = f"{API_URL}/cards/{args.card_id}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    card = response.json()
    print_card(card, verbose=True)
    return 0


def cmd_create(args):
    """Create a new card"""
    data = {
        "title": args.title,
        "description": args.description or "",
        "column_id": args.column or "col-1",
        "tags": args.tags.split(",") if args.tags else ["tag-2"],  # Default to AI tag
        "source": "ai",
        "creator_id": args.agent or "ai-claude"
    }
    
    board_id = args.board or "board-1"
    url = f"{API_URL}/boards/{board_id}/cards"
    response = requests.post(url, json=data)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    card = response.json()
    print(f"{Colors.GREEN}✅ Card created successfully!{Colors.END}")
    print_card(card)
    return 0


def cmd_claim(args):
    """Claim a task for AI processing"""
    data = {
        "card_id": args.card_id,
        "agent_id": args.agent
    }
    
    url = f"{API_URL}/ai/claim-task"
    response = requests.post(url, json=data)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    card = response.json()
    print(f"{Colors.GREEN}✅ Task claimed successfully!{Colors.END}")
    print_card(card)
    return 0


def cmd_status(args):
    """Update task status"""
    data = {
        "card_id": args.card_id,
        "status": args.status,
        "progress": args.progress,
        "message": args.message
    }
    
    url = f"{API_URL}/ai/update-status"
    response = requests.post(url, json=data)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    print(f"{Colors.GREEN}✅ Status updated to: {args.status}{Colors.END}")
    return 0


def cmd_move(args):
    """Move a card to a different column"""
    # First get current version
    url = f"{API_URL}/cards/{args.card_id}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error getting card: {response.text}{Colors.END}")
        return 1
    
    card = response.json()
    
    data = {
        "column_id": args.column,
        "version": card["version"]
    }
    
    url = f"{API_URL}/cards/{args.card_id}/move?modifier_id={args.agent or 'ai-claude'}"
    response = requests.patch(url, json=data)
    
    if response.status_code == 409:
        print(f"{Colors.YELLOW}⚠️ Version conflict! Please refetch and retry.{Colors.END}")
        return 1
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    print(f"{Colors.GREEN}✅ Card moved to column: {args.column}{Colors.END}")
    return 0


def cmd_comment(args):
    """Add a comment to a card"""
    data = {
        "text": args.message,
        "author_id": args.agent or "ai-claude"
    }
    
    url = f"{API_URL}/cards/{args.card_id}/comments"
    response = requests.post(url, json=data)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    print(f"{Colors.GREEN}✅ Comment added!{Colors.END}")
    return 0


def cmd_log(args):
    """Add an execution log entry"""
    data = {
        "card_id": args.card_id,
        "log_type": args.type,
        "message": args.message
    }
    
    url = f"{API_URL}/ai/add-log"
    response = requests.post(url, json=data)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    print(f"{Colors.GREEN}✅ Log added!{Colors.END}")
    return 0


def cmd_poll(args):
    """Poll for changes"""
    params = {}
    if args.since:
        params["since"] = args.since
    if args.board:
        params["board_id"] = args.board
    
    url = f"{API_URL}/sync/poll"
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    data = response.json()
    cards = data.get("cards", [])
    
    print(f"\n{Colors.BOLD}🔄 Sync Poll Results{Colors.END}")
    print(f"Last sync: {data.get('last_sync')}")
    print(f"Has conflicts: {data.get('has_conflicts')}")
    print(f"Updated cards: {len(cards)}")
    
    for card in cards:
        print_card(card)
    
    return 0


def cmd_files(args):
    """List files"""
    params = {}
    if args.scope:
        params["scope"] = args.scope
    if args.card:
        params["card_id"] = args.card
    
    url = f"{API_URL}/files"
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    files = response.json()
    print(f"\n{Colors.BOLD}📁 Files ({len(files)} total){Colors.END}")
    print("-" * 50)
    
    for f in files:
        print_file(f)
    
    return 0


def cmd_file_get(args):
    """Get file content"""
    url = f"{API_URL}/files/{args.file_id}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    file = response.json()
    print_file(file)
    print(f"\n{Colors.BOLD}Content:{Colors.END}")
    print("-" * 50)
    print(file.get("content", ""))
    return 0


def cmd_file_create(args):
    """Create a new file"""
    # Read content from file if provided
    content = args.content
    if args.file:
        with open(args.file, "r") as f:
            content = f.read()
    
    data = {
        "name": args.name,
        "type": args.type,
        "content": content,
        "scope": args.scope or "project",
        "card_id": args.card,
        "created_by": args.agent or "ai-claude"
    }
    
    url = f"{API_URL}/files"
    response = requests.post(url, json=data)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    file = response.json()
    print(f"{Colors.GREEN}✅ File created successfully!{Colors.END}")
    print_file(file)
    return 0


def cmd_available(args):
    """Get available tasks for AI"""
    params = {}
    if args.board:
        params["board_id"] = args.board
    
    url = f"{API_URL}/ai/available-tasks"
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error: {response.text}{Colors.END}")
        return 1
    
    cards = response.json()
    print(f"\n{Colors.BOLD}🎯 Available Tasks for AI ({len(cards)} total){Colors.END}")
    print("-" * 50)
    
    for card in cards:
        print_card(card)
    
    return 0


def main():
    parser = argparse.ArgumentParser(
        description="SyncBoard CLI - AI Agent Interface for Kanban Board",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  syncboard list --source ai
  syncboard get card-3001
  syncboard create --title "Implement feature X" --description "Details..."
  syncboard claim card-3001 --agent ai-claude
  syncboard status card-3001 --status running --progress 50
  syncboard move card-3001 --column col-3
  syncboard comment card-3001 --message "Started working on this"
  syncboard log card-3001 --type info --message "Analyzing codebase"
  syncboard available
  syncboard files --scope project
  syncboard file-create --name "instruct.md" --type markdown --content "# Instructions"
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List cards")
    list_parser.add_argument("--board", help="Board ID")
    list_parser.add_argument("--source", choices=["human", "ai"], help="Filter by source")
    
    # Get command
    get_parser = subparsers.add_parser("get", help="Get a specific card")
    get_parser.add_argument("card_id", help="Card ID")
    
    # Create command
    create_parser = subparsers.add_parser("create", help="Create a new card")
    create_parser.add_argument("--title", required=True, help="Card title")
    create_parser.add_argument("--description", help="Card description")
    create_parser.add_argument("--board", help="Board ID")
    create_parser.add_argument("--column", help="Column ID")
    create_parser.add_argument("--tags", help="Comma-separated tag IDs")
    create_parser.add_argument("--agent", help="Agent ID")
    
    # Claim command
    claim_parser = subparsers.add_parser("claim", help="Claim a task")
    claim_parser.add_argument("card_id", help="Card ID")
    claim_parser.add_argument("--agent", required=True, help="Agent ID")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Update task status")
    status_parser.add_argument("card_id", help="Card ID")
    status_parser.add_argument("--status", required=True, choices=["idle", "running", "completed", "failed", "paused"])
    status_parser.add_argument("--progress", type=int, help="Progress percentage")
    status_parser.add_argument("--message", help="Status message")
    
    # Move command
    move_parser = subparsers.add_parser("move", help="Move a card")
    move_parser.add_argument("card_id", help="Card ID")
    move_parser.add_argument("--column", required=True, help="Target column ID")
    move_parser.add_argument("--agent", help="Agent ID")
    
    # Comment command
    comment_parser = subparsers.add_parser("comment", help="Add a comment")
    comment_parser.add_argument("card_id", help="Card ID")
    comment_parser.add_argument("--message", required=True, help="Comment text")
    comment_parser.add_argument("--agent", help="Agent ID")
    
    # Log command
    log_parser = subparsers.add_parser("log", help="Add execution log")
    log_parser.add_argument("card_id", help="Card ID")
    log_parser.add_argument("--type", required=True, choices=["info", "success", "error", "warning"])
    log_parser.add_argument("--message", required=True, help="Log message")
    
    # Poll command
    poll_parser = subparsers.add_parser("poll", help="Poll for changes")
    poll_parser.add_argument("--since", help="Timestamp (ISO format)")
    poll_parser.add_argument("--board", help="Board ID")
    
    # Available command
    available_parser = subparsers.add_parser("available", help="Get available tasks for AI")
    available_parser.add_argument("--board", help="Board ID")
    
    # Files command
    files_parser = subparsers.add_parser("files", help="List files")
    files_parser.add_argument("--scope", choices=["project", "task"], help="File scope")
    files_parser.add_argument("--card", help="Card ID to filter by")
    
    # File-get command
    file_get_parser = subparsers.add_parser("file-get", help="Get file content")
    file_get_parser.add_argument("file_id", help="File ID")
    
    # File-create command
    file_create_parser = subparsers.add_parser("file-create", help="Create a new file")
    file_create_parser.add_argument("--name", required=True, help="File name")
    file_create_parser.add_argument("--type", required=True, choices=["markdown", "json", "code"])
    file_create_parser.add_argument("--content", help="File content")
    file_create_parser.add_argument("--file", help="Read content from file")
    file_create_parser.add_argument("--scope", choices=["project", "task"])
    file_create_parser.add_argument("--card", help="Card ID to link")
    file_create_parser.add_argument("--agent", help="Agent ID")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    commands = {
        "list": cmd_list,
        "get": cmd_get,
        "create": cmd_create,
        "claim": cmd_claim,
        "status": cmd_status,
        "move": cmd_move,
        "comment": cmd_comment,
        "log": cmd_log,
        "poll": cmd_poll,
        "available": cmd_available,
        "files": cmd_files,
        "file-get": cmd_file_get,
        "file-create": cmd_file_create,
    }
    
    return commands[args.command](args)


if __name__ == "__main__":
    sys.exit(main())
