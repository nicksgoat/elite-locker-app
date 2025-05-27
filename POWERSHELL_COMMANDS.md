# 💻 PowerShell Commands for Elite Locker

## ❌ Common PowerShell Syntax Errors

### Wrong (Bash syntax):
```bash
cd elite-locker && npm start    # ❌ PowerShell doesn't support &&
npm start -- --clear           # ❌ From wrong directory
```

### ✅ Correct PowerShell syntax:
```powershell
cd elite-locker
npm start

# OR start with clear cache:
cd elite-locker
npx expo start --clear

# OR run from root directory:
cd "C:\Users\Nick\New folder\elite-locker"
npm start
```

## 📋 Common Commands

### Start the app:
```powershell
cd elite-locker
npm start
```

### Start with clear cache:
```powershell
cd elite-locker
npx expo start --clear
```

### Install dependencies:
```powershell
cd elite-locker
npm install
```

### Run on iOS simulator:
```powershell
cd elite-locker
npm run ios
```

### Run on Android:
```powershell
cd elite-locker
npm run android
```

### Build for web:
```powershell
cd elite-locker
npm run web
```

## 🔧 Troubleshooting Commands

### Clear everything and reinstall:
```powershell
cd elite-locker
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
npx expo start --clear
```

### Check npm and node versions:
```powershell
node --version
npm --version
```

## 💡 Tips

1. **Always navigate to elite-locker directory first**
2. **Use separate lines instead of && operator**
3. **Use double quotes for paths with spaces**
4. **Use `npx expo start --clear` when making configuration changes** 