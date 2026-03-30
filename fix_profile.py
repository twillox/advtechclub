import re
import sys

def fix_profile():
    with open('frontend/src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove all responsive classes
    content = re.sub(r'\b(md|lg|sm):[a-zA-Z0-9\-\[\]\.\/]+', '', content)
    
    # Also adjust the main container from max-w-5xl to max-w-md
    content = content.replace('max-w-5xl', 'max-w-md')
    
    # Remove extra spaces in class names
    content = re.sub(r'\s+', ' ', content)
    
    # Just to retain standard formatting of jsx slightly, it's better to just write it back
    # Wait, collapse multiline might break imports or jsx formatting if I do \s+. Let's just do single spaces inside className.
    pass

def fix_profile_v2():
    with open('frontend/src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to cleanly remove space+md:xyz inside quotes or outside
    content = re.sub(r'\b(md|lg|sm|xl):[a-zA-Z0-9\-\[\]\.\/]+', '', content)
    content = content.replace('max-w-5xl', 'max-w-md')
    
    # cleanup double spaces that might have been left over
    content = content.replace('  ', ' ')
    
    with open('frontend/src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_profile_v2()
