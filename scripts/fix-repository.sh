#!/bin/bash

# Script to fix the embedded Git repository issue in Elite Locker

# Print colored messages
print_message() {
    echo -e "\033[1;34m>>> $1\033[0m"
}

print_success() {
    echo -e "\033[1;32m>>> $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m>>> $1\033[0m"
}

# Check if we're in the elite-locker directory
if [[ $(basename $(pwd)) != "elite-locker" ]]; then
    print_error "Please run this script from the elite-locker directory"
    exit 1
fi

print_message "Starting cleanup of embedded repository..."

# Check if elitelockercursor exists
if [ -d "elitelockercursor" ]; then
    print_message "Found embedded repository in elitelockercursor/"
    
    # Backup app directory if needed
    if [ -d "elitelockercursor/app" ]; then
        print_message "Checking if there are any new files in the embedded repo..."
        
        # Compare directories
        DIFF_COUNT=$(diff -r app elitelockercursor/app | wc -l)
        
        if [ $DIFF_COUNT -gt 0 ]; then
            print_message "Found differences between app/ and elitelockercursor/app/"
            print_message "Creating backup in .backup_embedded_repo/"
            
            # Create backup directory
            mkdir -p .backup_embedded_repo
            
            # Copy the files
            cp -R elitelockercursor/* .backup_embedded_repo/
            
            print_success "Backup created in .backup_embedded_repo/"
        else
            print_message "No new content found in embedded repository"
        fi
    fi
    
    # Remove the embedded repository
    print_message "Removing embedded repository..."
    rm -rf elitelockercursor
    
    print_success "Embedded repository removed"
else
    print_message "No embedded repository found"
fi

# Check for and remove any embedded .git directories
EMBEDDED_GIT=$(find . -path "*/\.*" -prune -o -path "./node_modules/*" -prune -o -name ".git" -type d -not -path "./.git" -print)

if [ -n "$EMBEDDED_GIT" ]; then
    print_message "Found embedded .git directories:"
    echo "$EMBEDDED_GIT"
    
    print_message "Removing embedded .git directories..."
    
    for GIT_DIR in $EMBEDDED_GIT; do
        rm -rf "$GIT_DIR"
        print_message "Removed: $GIT_DIR"
    done
    
    print_success "All embedded .git directories removed"
else
    print_message "No embedded .git directories found"
fi

print_success "Cleanup completed successfully!"
print_message "You should now be able to use Git normally with this repository"
print_message "Restart your development server with 'npx expo start --clear'"

exit 0 