import 'regenerator-runtime/runtime';

import Store from "./store";

const header = new Headers({
    'Accept': 'application/vnd.github.v3+json'
});

const form = document.querySelector('form');
const container = document.querySelector("#main-articlesContainer");
const title = document.querySelector("main > h4");

if (!form) throw new Error("Form not found!");
if (!container) throw new Error("container not found!");
if (!title) throw new Error("title not found!");

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    if (!name || name.length < 3) throw new Error(`Organization name has to be at least 3 characters of length!`);

    // fetch organization with repos
    const org = await fetchRepos(name);
    if(!org) return alert("Couldn't fetch Organization!");

    title.innerText = name;

    // display summary to main panel
    org?.repos.forEach(repo => {
        let article = document.querySelector(`#repo-${repo.id}`);
        if (!article) {
            article = document.createRange().createContextualFragment(`
                <article id="repo-${repo.id}"> 
                    <p><b>Repo:</b> ${repo.name}</p>
                    <p><b>Description:</b> ${repo.description}</p>
                    <p><b>URL:</b> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                </article>
            `);

            container.appendChild(article);
        }
    });
});



/**
 * Returns fetched repository or error
 * @param {string} name Repository name
 * @returns {(object|null)} Repository object
 */
const fetchRepos = async (name) => {
    name = name.toLowerCase();

    if (Store.hasItem(name)) return Store.getItem(name);

    let org,repos;
    try { 
        org = await fetch(`https://api.github.com/orgs/${name}`, header).then(res => res.json()).catch(er=> { throw er });
        repos = await fetch(`https://api.github.com/orgs/${name}/repos`, header).then(res => res.json()).catch(er=> { throw er });

        if(org.message == "Not Found" || repos.message === "Not Found") throw `Couldn't find organization: ${name}!`;

        org.repos = repos;
        Store.addItem(name, org);
    }
    catch(er){
        org = repos = null;
        console.error(`fetcherror : ${er}`);
    }

    return org;
}
