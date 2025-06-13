# Upload Directory Structure

This directory contains all uploaded files organized as follows:

## Structure
- `images/` - General images not associated with specific tests
- `avatars/` - User profile pictures
- `documents/` - General documents
- `tests/` - Test-specific uploads organized by test name and date

## Test Folders
Test folders are automatically created with the format:
`Test-Name_YYYY-MM-DD`

For example:
- `Physics-Chapter-1-Motion_2024-01-15/`
- `Mathematics-Algebra-Test_2024-01-16/`

Each test folder contains:
- `images/` - Question images, option images, explanation images
- `documents/` - PDF uploads, answer keys, etc.

## File Naming Convention
- Question images: `q{index}_question_{uuid}.jpg`
- Option images: `q{index}_option_{uuid}.jpg`
- Explanation images: `q{index}_explanation_{uuid}.jpg`
- General images: `image_{uuid}.jpg`
