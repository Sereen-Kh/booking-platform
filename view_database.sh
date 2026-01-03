#!/bin/bash

# Database Viewing Script for Booking Platform
# This script provides easy access to inspect PostgreSQL database tables

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database connection details
DB_CONTAINER="booking-platform-db-1"
DB_USER="postgres"
DB_NAME="booking_db"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Database Viewer - Booking Platform${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to execute SQL query
run_query() {
    docker-compose exec -T db psql -U $DB_USER -d $DB_NAME -c "$1"
}

# Function to display menu
show_menu() {
    echo -e "\n${GREEN}Available Options:${NC}"
    echo "1) View all users (with profile fields)"
    echo "2) View provider profiles"
    echo "3) View users with profile completion status"
    echo "4) View all providers with their details"
    echo "5) View database schema (all tables)"
    echo "6) View users table structure"
    echo "7) View provider_profiles table structure"
    echo "8) Count records in each table"
    echo "9) View recent registrations (last 10 users)"
    echo "10) View providers needing profile completion"
    echo "11) Custom SQL query"
    echo "0) Exit"
    echo -e "\n${YELLOW}Enter your choice:${NC} "
}

# Function to view all users
view_users() {
    echo -e "\n${BLUE}=== All Users ===${NC}"
    run_query "SELECT id, email, full_name, role, phone, address, bio, is_profile_complete, created_at FROM users ORDER BY created_at DESC;"
}

# Function to view provider profiles
view_provider_profiles() {
    echo -e "\n${BLUE}=== Provider Profiles ===${NC}"
    run_query "SELECT pp.id, pp.user_id, u.full_name, u.email, pp.business_name, pp.bio, pp.location, pp.availability, pp.created_at, pp.updated_at FROM provider_profiles pp JOIN users u ON pp.user_id = u.id ORDER BY pp.created_at DESC;"
}

# Function to view profile completion status
view_profile_completion() {
    echo -e "\n${BLUE}=== User Profile Completion Status ===${NC}"
    run_query "SELECT id, full_name, email, role, phone, address, CASE WHEN bio IS NOT NULL THEN 'Yes' ELSE 'No' END as has_bio, is_profile_complete, created_at FROM users ORDER BY role, is_profile_complete DESC;"
}

# Function to view all providers with details
view_all_providers() {
    echo -e "\n${BLUE}=== All Providers with Details ===${NC}"
    run_query "SELECT u.id as user_id, u.email, u.full_name, u.phone, u.address, u.is_profile_complete, pp.business_name, pp.bio as provider_bio, pp.location, pp.availability FROM users u LEFT JOIN provider_profiles pp ON u.id = pp.user_id WHERE u.role = 'provider' ORDER BY u.created_at DESC;"
}

# Function to view database schema
view_schema() {
    echo -e "\n${BLUE}=== Database Tables ===${NC}"
    run_query "\dt"
}

# Function to view users table structure
view_users_structure() {
    echo -e "\n${BLUE}=== Users Table Structure ===${NC}"
    run_query "\d users"
}

# Function to view provider_profiles table structure
view_provider_profiles_structure() {
    echo -e "\n${BLUE}=== Provider Profiles Table Structure ===${NC}"
    run_query "\d provider_profiles"
}

# Function to count records
count_records() {
    echo -e "\n${BLUE}=== Record Counts ===${NC}"
    echo -e "${GREEN}Total Users:${NC}"
    run_query "SELECT COUNT(*) as total_users FROM users;"
    
    echo -e "\n${GREEN}Users by Role:${NC}"
    run_query "SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC;"
    
    echo -e "\n${GREEN}Profile Completion:${NC}"
    run_query "SELECT is_profile_complete, COUNT(*) as count FROM users GROUP BY is_profile_complete;"
    
    echo -e "\n${GREEN}Provider Profiles:${NC}"
    run_query "SELECT COUNT(*) as total_provider_profiles FROM provider_profiles;"
}

# Function to view recent registrations
view_recent_registrations() {
    echo -e "\n${BLUE}=== Recent Registrations (Last 10) ===${NC}"
    run_query "SELECT id, email, full_name, role, is_profile_complete, created_at FROM users ORDER BY created_at DESC LIMIT 10;"
}

# Function to view providers needing completion
view_incomplete_providers() {
    echo -e "\n${BLUE}=== Providers Needing Profile Completion ===${NC}"
    run_query "SELECT u.id, u.email, u.full_name, u.phone, u.address, CASE WHEN u.bio IS NULL THEN 'Missing' ELSE 'Present' END as bio_status, pp.business_name, pp.location FROM users u LEFT JOIN provider_profiles pp ON u.id = pp.user_id WHERE u.role = 'provider' AND u.is_profile_complete = false ORDER BY u.created_at DESC;"
}

# Function to run custom query
custom_query() {
    echo -e "\n${YELLOW}Enter your SQL query (end with semicolon):${NC}"
    read -r query
    echo -e "\n${BLUE}=== Query Result ===${NC}"
    run_query "$query"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if database container is running
if ! docker-compose ps | grep -q "db.*Up"; then
    echo -e "${RED}Error: Database container is not running.${NC}"
    echo -e "${YELLOW}Starting services...${NC}"
    docker-compose up -d db
    sleep 3
fi

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1) view_users ;;
        2) view_provider_profiles ;;
        3) view_profile_completion ;;
        4) view_all_providers ;;
        5) view_schema ;;
        6) view_users_structure ;;
        7) view_provider_profiles_structure ;;
        8) count_records ;;
        9) view_recent_registrations ;;
        10) view_incomplete_providers ;;
        11) custom_query ;;
        0) 
            echo -e "\n${GREEN}Goodbye!${NC}\n"
            exit 0
            ;;
        *) 
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo -e "\n${YELLOW}Press Enter to continue...${NC}"
    read -r
done
