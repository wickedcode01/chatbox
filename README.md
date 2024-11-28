<p align="right">
  <a href="README.md">English</a> |
  <a href="./doc/README-CN.md">简体中文</a>
</p>

This is the repository for the Chatbox Community Edition, open-sourced under the GPLv3 license. 

Wickedcode: Hey folks, this is wicked. I've modified the code to add support for Claude and online search.

You can also visit the original project for more details.


---

<h1 align="center">
<img src='./doc/statics/icon.png' width='30'>
<span>
    Chatbox
    <span style="font-size:8px; font-weight: normal;">(Community Edition)</span>
</span>
</h1>
<p align="center">
    <em>Your Ultimate AI Copilot on the Desktop. <br />Chatbox is a desktop client for ChatGPT, Claude and other LLMs, available on Windows, Mac, Linux</em>
</p>

<p align="center">
<a href="https://github.com/Bin-Huang/chatbox/releases" target="_blank">
<img alt="macOS" src="https://img.shields.io/badge/-macOS-black?style=flat-square&logo=apple&logoColor=white" />
</a>
<a href="https://github.com/Bin-Huang/chatbox/releases" target="_blank">
<img alt="Windows" src="https://img.shields.io/badge/-Windows-blue?style=flat-square&logo=windows&logoColor=white" />
</a>
<a href="https://github.com/Bin-Huang/chatbox/releases" target="_blank">
<img alt="Linux" src="https://img.shields.io/badge/-Linux-yellow?style=flat-square&logo=linux&logoColor=white" />
</a>
<a href="https://github.com/Bin-Huang/chatbox/releases" target="_blank">
<img alt="Downloads" src="https://img.shields.io/github/downloads/Bin-Huang/chatbox/total.svg?style=flat" />
</a>
<a href="https://twitter.com/benn_huang" target="_blank">
<img alt="Twitter" src="https://img.shields.io/badge/follow-benn_huang-blue?style=flat&logo=Twitter" />
</a>
</p>

<a href="https://www.producthunt.com/posts/chatbox?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-chatbox" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=429547&theme=light" alt="Chatbox - Better&#0032;UI&#0032;&#0038;&#0032;Desktop&#0032;App&#0032;for&#0032;ChatGPT&#0044;&#0032;Claude&#0032;and&#0032;other&#0032;LLMs&#0046; | Product Hunt" style="width: 150px; height: 30px;" width="100" height="40" /></a>

<a href="./doc/statics/snapshot_light.png">
<img src="./doc/statics/snapshot_light.png" width="400"/>
</a>
<a href="./doc/statics/snapshot_dark.png">
<img src="./doc/statics/snapshot_dark.png" width="400"/>
</a>

<!-- <table>
<tr>
<td>
<img src="./dec/../doc/demo_mobile_1.png" alt="App Screenshot" style="box-shadow: 2px 2px 10px rgba(0,0,0,0.1); border: 1px solid #ddd; border-radius: 8px; height: 300px" />
</td>
<td>
<img src="./dec/../doc/demo_mobile_2.png" alt="App Screenshot" style="box-shadow: 2px 2px 10px rgba(0,0,0,0.1); border: 1px solid #ddd; border-radius: 8px; height: 300px" />
</td>
</tr>
</table> -->

## Features

-   **Local Data Storage**  
    :floppy_disk: Your data remains on your device, ensuring it never gets lost and maintains your privacy.

-   **No-Deployment Installation Packages**  
    :package: Get started quickly with downloadable installation packages. No complex setup necessary!

-   **Support for Multiple LLM Providers**  
    :gear: Seamlessly integrate with a variety of cutting-edge language models:

    -   OpenAI (ChatGPT)
    -   Azure OpenAI
    -   Claude
    -   Google Gemini Pro
    -   Ollama (enable access to local models like llama2, Mistral, Mixtral, codellama, vicuna, yi, and solar)
    -   ChatGLM-6B

-   **Image Generation with Dall-E-3**  
    :art: Create the images of your imagination with Dall-E-3.

-   **Enhanced Prompting**  
    :speech_balloon: Advanced prompting features to refine and focus your queries for better responses.

-   **Keyboard Shortcuts**  
    :keyboard: Stay productive with shortcuts that speed up your workflow.

-   **Markdown, Latex & Code Highlighting**  
    :scroll: Generate messages with the full power of Markdown and Latex formatting, coupled with syntax highlighting for various programming languages, enhancing readability and presentation.

-   **Prompt Library & Message Quoting**  
    :books: Save and organize prompts for reuse, and quote messages for context in discussions.

-   **Streaming Reply**  
    :arrow_forward: Provide rapid responses to your interactions with immediate, progressive replies.

-   **Ergonomic UI & Dark Theme**  
    :new_moon: A user-friendly interface with a night mode option for reduced eye strain during extended use.

-   **Team Collaboration**  
    :busts_in_silhouette: Collaborate with ease and share OpenAI API resources among your team. [Learn More](./team-sharing/README.md)

-   **Cross-Platform Availability**  
    :computer: Chatbox is ready for Windows, Mac, Linux users.

-   **Access Anywhere with the Web Version**  
    :globe_with_meridians: Use the web application on any device with a browser, anywhere.

-   **iOS & Android**  
    :phone: Use the mobile applications that will bring this power to your fingertips on the go.

-   **Multilingual Support**  
    :earth_americas: Catering to a global audience by offering support in multiple languages:

    -   English
    -   简体中文 (Simplified Chinese)
    -   繁體中文 (Traditional Chinese)
    -   日本語 (Japanese)
    -   한국어 (Korean)
    -   Français (French)
    -   Deutsch (German)
    -   Русский (Russian)

-   **And More...**  
    :sparkles: Constantly enhancing the experience with new features!

## FAQ

-   [Frequently Asked Questions](./doc/FAQ.md)

## Why I made Chatbox?

I developed Chatbox initially because I was debugging some prompts and found myself in need of a simple and easy-to-use prompt and API debugging tool. I thought there might be more people who needed such a tool, so I open-sourced it.

At first, I didn't know that it would be so popular. I listened to the feedback from the open-source community and continued to develop and improve it. Now, it has become a very useful AI desktop application. There are many users who love Chatbox, and they not only use it for developing and debugging prompts, but also for daily chatting, and even to do some more interesting things like using well-designed prompts to make AI play various professional roles to assist them in everyday work...

## How to Contribute

Any form of contribution is welcome, including but not limited to:

-   Submitting issues
-   Submitting pull requests
-   Submitting feature requests
-   Submitting bug reports
-   Submitting documentation revisions
-   Submitting translations
-   Submitting any other forms of contribution

## Build Instructions

1. Clone the repository from Github

```bash
git clone https://github.com/Bin-Huang/chatbox.git
```

2. Install the required dependencies

```bash
npm install
```

3. Start the application (in development mode)

```bash
npm run dev
```

4. Build the application, package the installer for current platform

```bash
npm run package
```

5. Build the application, package the installer for all platforms

```bash
npm run package:all
```

## License

[LICENSE](./LICENSE)
