# Git Commands File

## Adding a Git Submodule

```bash
git submodule add <repository_url> [path]
```

### Example

```bash
git submodule add https://github.com/example/repo.git libs/example
```

### After adding, you need to commit the changes

```bash
git add .
git commit -m "Added submodule example"
```

### To initialize and update submodules after cloning a repo with submodules

```bash
git submodule init
git submodule update
```

### Or do both in one command

```bash
git submodule update --init
```
