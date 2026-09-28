# 🚘 biar-fca

[![npm version](https://img.shields.io/npm/v/biar-fca.svg)](https://www.npmjs.com/package/biar-fca)
[![npm downloads](https://img.shields.io/npm/dm/biar-fca.svg)](https://www.npmjs.com/package/biar-fca)

💁 **biar-fca** is a fully refactored Facebook Chat API (FCA) client built for **reliable**, **real-time**, and **modular** interaction with Facebook Messenger. Designed with modern bot development in mind, it offers full control over Messenger automation through a clean, stable interface.

**Pure NPM Package** - Just `npm install biar-fca` and start building with built-in advanced anti-detection!

> 🔀 **Forked from [ws3-fca](https://github.com/NethWs3Dev/ws3-fca)** - Enhanced and maintained by Jubiar

---

## 📚 Documentation & Feedback

Full documentation and advanced examples:
[https://exocore-dev-docs-exocore.hf.space](https://exocore-dev-docs-exocore.hf.space)

If you encounter issues or want to give feedback, feel free to message us via Facebook:

* [@Kenneth Aceberos](https://www.facebook.com/Neth.Ace.7/)
* [@Johnsteve Costaños](https://www.facebook.com/johnstevecostanos2025/)
* [@Jonell Magallanes 󱢏](https://www.facebook.com/ccprojectsjonell10/)

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and version history.

---

## ✨ Features

* 🔐 **Precise Login Mechanism**
  Dynamically scrapes Facebook's login form and submits tokens for secure authentication.

* 💬 **Real-time Messaging**
  Send and receive messages (text, attachments, stickers, replies).

* 📝 **Message Editing**
  Edit your bot's messages in-place.

* ✍️ **Typing Indicators**
  Detect and send typing status.

* ✅ **Message Status Handling**
  Mark messages as delivered, read, or seen.

* 📂 **Thread Management**

  * Retrieve thread details
  * Load thread message history
  * Get lists with filtering
  * Pin/unpin messages

* 👤 **User Info Retrieval**
  Access name, ID, profile picture, and mutual context.

* 🖼️ **Sticker API**
  Search stickers, list packs, fetch store data, AI-stickers.

* 💬 **Post Interaction**
  Comment and reply to public Facebook posts.

* ➕ **Follow/Unfollow Users**
  Automate social interactions.

* 🌐 **Proxy Support**
  Full support for custom proxies with testing utilities.

* 🧱 **Modular Architecture**
  Organized into pluggable models for maintainability.

* 🛡️ **Robust Error Handling**
  Retry logic, consistent logging, and graceful failovers.

---

## ⚙️ Installation

> Requires **Node.js v20+**

```bash
npm i biar-fca@latest
```

---

## 🛡️ Advanced Anti-Detection Protection

**biar-fca** includes built-in advanced anti-detection protection in the core library!

### ⚡ Protection Features (Automatically Enabled)

When you use `biar-fca`, you automatically get:

- 🔐 **Session Fingerprint Management** - Realistic browser fingerprints with 6hr auto-rotation
- 🎭 **Request Obfuscation** - Multi-layer obfuscation with entropy injection
- 🔀 **Pattern Diffusion** - Adaptive delays to prevent detectable patterns
- 🛡️ **Traffic Analysis Resistance** - Timing jitter and variability
- 📊 **Smart Rate Limiting** - Intelligent message pacing
- 🔒 **MQTT Protection** - Obfuscated MQTT traffic
- ⏱️ **Response Time** - 50-200ms with protection layers
- 🆔 **Realistic Device IDs** - Generated from system hardware
- 🌍 **Random User Agents** - Latest Chrome/Edge configurations
- 🔄 **Automatic Presence** - Maintain realistic presence and connection health

### 📖 Using Advanced Protection

```js
const { login } = require("biar-fca");

login(credentials, {
  advancedProtection: true,      // Default: true (always enabled)
  autoRotateSession: true,       // Default: true (6hr rotation)
  randomUserAgent: true,         // Default: true (realistic UAs)
  updatePresence: true,          // Maintain realistic presence
  autoMarkDelivery: true,        // Realistic delivery receipts
  autoMarkRead: true             // Realistic read receipts
}, (err, api) => {
  // Your bot code here
  
  // Check protection stats
  const stats = api.getProtectionStats();
  console.log('Protection Status:', stats);
});
```

### 🚀 Building Your Bot

Create your bot file (e.g., `bot.js`):

```js
const { login } = require("biar-fca");
const fs = require("fs");

const credentials = {
  appState: JSON.parse(fs.readFileSync("appstate.json", "utf8"))
};

login(credentials, {
  advancedProtection: true,  // Automatic protection
  updatePresence: true,
  autoMarkRead: true
}, (err, api) => {
  if (err) return console.error(err);
  
  console.log("✅ Bot online with protection!");
  
  api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    if (event.type !== "message") return;
    
    // Handle messages
    console.log("Message:", event.body);
    api.sendMessage("Hello!", event.threadID);
  });
});
```

Then run: `node bot.js`

---

## 🚀 Getting Started

### 1. Install via NPM

```bash
npm install biar-fca
```

### 2. Generate `appstate.json`

This file contains your Facebook session cookies.
Use a browser extension (e.g. "C3C FbState", "CookieEditor") to export cookies after logging in, and save them in this format:

```json
[
  {
    "key": "c_user",
    "value": "your-id"
  }
]
```

If you don't know how to get cookie, you can follow this tutorial **[here](https://appstate-tutorial-ws3.pages.dev)**.

Place this file in the root directory as `appstate.json`.

---

### 3. Basic Usage Example

```js
const fs = require("fs");
const path = require("path");
const { login } = require("biar-fca");

let credentials;
try {
  credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };
} catch (err) {
  console.error("❌ appstate.json is missing or malformed.", err);
  process.exit(1);
}

console.log("Logging in...");

login(credentials, {
  online: true,
  updatePresence: true,
  selfListen: false,
  // Advanced Protection Features (enabled by default)
  advancedProtection: true,      // Enable anti-detection features
  autoRotateSession: true,       // Auto-rotate session fingerprints
  randomUserAgent: true,         // Use realistic random user agents
  autoMarkDelivery: true,        // Realistic message behavior
  autoMarkRead: true             // Realistic read behavior
}, async (err, api) => {
  if (err) return console.error("LOGIN ERROR:", err);

  console.log(`✅ Logged in as: ${api.getCurrentUserID()}`);

  const commandsDir = path.join(__dirname, "modules", "commands");
  const commands = new Map();

  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

  for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(commandsDir, file));
    if (command.name && typeof command.execute === "function") {
      commands.set(command.name, command);
      console.log(`🔧 Loaded command: ${command.name}`);
    }
  }

  api.listenMqtt(async (err, event) => {
    if (err || !event.body || event.type !== "message") return;

    const prefix = "/";
    if (!event.body.startsWith(prefix)) return;

    const args = event.body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);
    if (!command) return;

    try {
      await command.execute({ api, event, args });
    } catch (error) {
      console.error(`Error executing ${commandName}:`, error);
      api.sendMessageMqtt("❌ An error occurred while executing the command.", event.threadID, event.messageID);
    }
  });
});
```

---


## 🙌 Credits

### Original Authors (ws3-fca)
* 🔧 **[@NethWs3Dev](https://github.com/NethWs3Dev) (Kenneth Aceberos)** – Main developer, equal maintainer, feature and patch contributions.
* 💧 **@ChoruOfficial (Johnsteve Costaños)** – Lead developer, refactor of original FCA code, Fully Setup MQTT.
* 🔮 **@CommunityExocore (Jonell Magallanes)** – Foundational core design and architecture.

### Current Maintainer (biar-fca)
* 🚀 **Jubiar** – Fork maintainer, enhancements, and ongoing development.

### Original FCA (2015)
> Copyright (c) 2015
> Avery, Benjamin, David, Maude

---

## 🔗 Related Resources

- **Original ws3-fca**: [https://github.com/NethWs3Dev/ws3-fca](https://github.com/NethWs3Dev/ws3-fca)
- **Documentation**: [https://exocore-dev-docs-exocore.hf.space](https://exocore-dev-docs-exocore.hf.space)
- **NPM Package**: [https://www.npmjs.com/package/biar-fca](https://www.npmjs.com/package/biar-fca)

---

## 📊 License

**MIT** – Free to use, modify, and distribute. Attribution appreciated.

---

## 🔄 Updating & Publishing

For maintainers: To update and republish the package:

```bash
# 1. Make your changes
# 2. Update version
npm version patch   # For bug fixes (3.5.2 → 3.5.3)
npm version minor   # For new features (3.5.2 → 3.6.2)
npm version major   # For breaking changes (3.5.2 → 4.0.0)

# 3. Publish
npm publish

# 4. Push to GitHub
git push && git push --tags
```

📖 **Detailed guide**: See [UPDATE_GUIDE.md](UPDATE_GUIDE.md)

---

## 🤝 Contributing

We welcome contributions! Whether it's bug fixes, new features, or documentation improvements:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

This project is not affiliated with, authorized, maintained, sponsored, or endorsed by Facebook or any of its affiliates. Use this library at your own risk. Automating Facebook accounts may violate Facebook's Terms of Service and could result in account restrictions or bans.

---

**Made with ❤️ by the biar-fca**
