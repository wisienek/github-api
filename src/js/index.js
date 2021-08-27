import 'regenerator-runtime/runtime';

import Store from "./store";

const header = new Headers({
    'Accept': 'application/vnd.github.v3+json'
});

const form = document.querySelector('form');
const container = document.querySelector("#main-articlesContainer");
const title = document.querySelector("main > h4");
const bgCover = document.querySelector("#bgCover");

if (!form) throw new Error("Form not found!");
if (!container) throw new Error("container not found!");
if (!title) throw new Error("title not found!");
if (!bgCover) throw new Error("bgCover not found!");

const popModal = async (name, id) => {
    if (!name || !id) throw new Error(`Name or id is undefined!`);

    const org = Store.getItem(name) || await fetchRepos(name);
    if (!org) return alert("Couldn't fetch Organization!");

    const repo = org?.repos.find(r => r.id === id);
    if (!repo) return alert(`Couldn't find repo ${id} in ${name} organization!`);

    const test = document.querySelector("#info-modal");
    if (test) test.remove();

    bgCover.style.display = "flex";

    bgCover.querySelector('.card-body').innerHTML = `
        <p><b>Organization:</b> ${name}</p>
        <p><b>Repozitory:</b> ${repo.name}</p>
        <p><b>URL & ssh:</b> <code>${repo.html_url}</code> | <code>${repo.ssh_url}</code></p>
        <p><b>Stars:</b> ${repo.stargazers_count}</p>
        <p><b>Size:</b> ${repo.size}</p>
        <p><b>Description:</b> ${repo.description}</p>
    `;
}

/**
 * Returns fetched Organization or error
 * @param {string} name Organization name
 * @returns {(object|null)} Organization object
 */
const fetchRepos = async (name) => {
    name = name.toLowerCase();

    if (Store.hasItem(name)) return Store.getItem(name);

    let org, repos;
    try {
        org = await fetch(`https://api.github.com/orgs/${name}`, header).then(res => res.json()).catch(er => {
            throw er
        });
        repos = await fetch(`https://api.github.com/orgs/${name}/repos`, header).then(res => res.json()).catch(er => {
            throw er
        });

        if (org.message == "Not Found" || repos.message === "Not Found") throw `Couldn't find organization: ${name}!`;

        org.repos = repos;
        Store.addItem(name, org);
    } catch (er) {
        org = repos = null;
        console.error(`fetcherror : ${er}`);
    }

    return org;
}


window.addEventListener('click', (e)=> e.target == bgCover? bgCover.style.display = 'none':null );

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    if (!name || name.length < 3) throw new Error(`Organization name has to be at least 3 characters of length!`);

    // fetch organization with repos
    const org = await fetchRepos(name);
    if (!org) return alert("Couldn't fetch Organization!");

    document.querySelectorAll('article').forEach(a=> a.remove() );

    title.innerText = name;

    // display summary to main panel
    org?.repos.forEach(repo => {
        let article = document.querySelector(`#repo-${repo.id}`);
        if (!article) {
            article = document.createRange().createContextualFragment(`
                <article class="noSelect" id="repo-${repo.id}" > 
                    <p><b>Repo:</b> ${repo.name}</p>
                    <p><b>Description:</b> ${repo.description}</p>
                    <p><b>URL:</b> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                </article>
            `);

            container.appendChild(article);
        }
    });
    document.querySelectorAll('article').forEach(a=>{
        a.addEventListener( 'click', () => popModal(name, Number(a.id.replace("repo-", '')) ) );
    })
});