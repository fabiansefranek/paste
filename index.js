function renderHTML(paste) {
    const seconds = {
        YEAR: 31104000,
        MONTH: 2592000,
        WEEK: 604800,
        DAY: 86400,
        HOUR: 3600,
        MINUTE: 60
    }

    const icon = "%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-clipboard'%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'%3E%3C/path%3E%3Crect x='8' y='2' width='8' height='4' rx='1' ry='1'%3E%3C/rect%3E%3C/svg%3E"
    const readOnly = (paste.text) ? 'readonly' : '';
    const pasteText = (paste.text) ? paste.text : '';
    const pasteTitle = (paste.title) ? escape(paste.title) : '';
    const pasteSize = (paste.text) ? (paste.text.length / 1000).toFixed(2) : '';
    const country = (pasteText) ? new Intl.DisplayNames(['en'], {type: 'region'}).of(paste.country) : '';
    const timeZone = (pasteText) ? paste.timezone : '';
    const createdAt = (pasteText) ? new Date(paste.createdAt).toISOString() : ''
    const expirationDate = (pasteText) ? new Date(new Date(paste.createdAt).getTime() + paste.expiration*1000) : ''
    let expiresIn = (pasteText) ? (expirationDate - Date.now())/1000 : ''
    Object.keys(seconds).forEach(key => {
        if(pasteText && expiresIn/seconds[key] >= 1) 
            expiresIn = `${Math.round(expiresIn/seconds[key])} ${key.toLowerCase()}s`
    })



    return `
        <!DOCTYPE html>
            <head>
                <title>${pasteText ? (pasteTitle ? pasteTitle : 'Untitled') : 'Paste'}</title>
                <link rel="icon" href="data:image/svg+xml,${icon}">
                <style>
                    html,body {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        width: 100%;
                        overflow: hidden;
                        background-color: #171717;
                        color: #b8b8b8;
                        font-family: sans-serif
                    }

                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center
                    }

                    form {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem
                    }

                    textarea {
                        color: #b8b8b8;
                        font-family: sans-serif;
                        font-size: medium;
                        background-color: #101010;
                        border: #3d3d3d 1px solid;
                        outline: none;
                        padding: 1rem;
                        border-radius: .5rem;
                        resize: none;
                        height: 70vh;
                        width: 70vw;
                        box-sizing: border-box;
                        overflow-x: auto;
                        white-space: pre;
                        cursor: auto;
                    }

                    button {
                        font-size: medium;
                        color: #b8b8b8;
                        background-color: #101010;
                        border: 1px solid #3d3d3d;
                        padding: 1rem;
                        border-radius: .4rem;
                        cursor: pointer;
                        flex: 1;
                    }

                    button:hover {
                        background-color: #131313
                    }

                    p {
                        color: #777;
                        margin: 0;
                        cursor: default;
                        user-select: none;
                    }

                    a {
                        color: #777;
                        cursor: pointer;
                    }

                    h2 {
                        margin: 0;
                    }
                    
                    select, input[type="text"] {
                        color: #b8b8b8;
                        background-color: #101010;
                        border: 1px solid #3d3d3d;
                        border-radius: .4rem;
                        padding: 1rem;
                        font-size: medium;
                        outline: 0;
                    }

                    #information {
                        display: flex;
                        flex-direction: row;
                        gap: 1rem;
                    }

                    ::-webkit-scrollbar {
                        height: 4px;
                        cursor: default;
                    }
                    ::-webkit-scrollbar-thumb {
                        background-color: rgba(155, 155, 155, 0.5);
                        border-radius: 20px;
                        border: transparent;
                    }
                </style>
            </head>
            <body>
                <form action="/" method="post">
                    ${pasteText && `<h2>${pasteTitle || 'Untitled'}</h2>`}
                    <textarea name="text" placeholder="Paste your text..." ${readOnly} spellcheck="false" required>${pasteText}</textarea>
                    ${pasteText ? `<p>Paste was created in ${country} at <span style="text-decoration: underline;text-decoration_-style: dotted;" title="${new Date(createdAt).toLocaleString('en-us', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}">${createdAt}</span>, expires in ${expiresIn} and has ${pasteSize} kb | <a href="/raw/${paste.uuid}">raw</a></p>` 
                    :  `<div id='information'><input type='text' name='title' placeholder='Paste Title'><select name='expiration' required><option disabled selected value=''>Select expiration</option><option value='${seconds.HOUR}'>1 Hour</option><option value='${seconds.DAY}'>1 Day</option><option value='${seconds.WEEK}'>1 Week</option><option value='${seconds.MONTH}'>1 Month</option><option value='${seconds.YEAR}'>1 Year</option></select><button>Create paste</button></div>`
                    }
                </form>
            </body>
    `;
}

function renderError(error) {
    return `
        <!DOCTYPE html>
            <head>
                <link rel="icon" href="data:image/svg+xml,${icon}">
                <title>Paste</title>
                <style>body,html{margin:0;padding:0;height:100%;width:100%;overflow:hidden;background-color:#171717;color:#b8b8b8;font-family:sans-serif}body{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:0.5rem;}h1{color:#777;margin:0;cursor:default;text-align:center}a{color:#777;}</style>
            </head>
            <body>
            <h1>${error.message}</h1>
            <a href="/">Go back</a>
        </body>
    `;
}

addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(request) {
    const { pathname } = new URL(request.url);
    const { headers } = request;
    let body = {}

  if (pathname === "/") {
      if(request.method === "GET") {
        return new Response(renderHTML({}), {headers: { "Content-Type": "text/html;charset=utf8" }});
      }
      if(request.method === "POST") {
        const contentType = headers.get('content-type') || '';
        if(contentType.includes("form")) {
            const formData = await request.formData();
            const pasteText = formData.get("text")
            const pasteLength = (new TextEncoder().encode(pasteText)).length
            if(pasteLength > 0 && pasteLength <= 1048576) {
                const title = formData.get("title")
                const uuid = crypto.randomUUID();
                const country = request.cf.country;
                const createdAt = Date.now();
                const ip = headers.get('CF-Connecting-IP')
                const expiration = parseInt(formData.get('expiration'))
                let options = {expirationTtl: expiration, metadata: {country: country, createdAt: createdAt, ip: ip, title: title, expiration: expiration}}
                await PASTE_DB.put(uuid, pasteText, options)
                return Response.redirect(`${request.url}${uuid}`, 302)
            } else {
                return new Response(renderError({message: "Paste is either too big or empty. Limit: 1MB"}),  {headers: { "Content-Type": "text/html;charset=utf8" }});
            }
        }

      }
  } else if(pathname.startsWith('/raw/')) {
      if(request.method === "GET") {
          const uuid = pathname.split('/raw/')[1];
          const value = await PASTE_DB.get(uuid);
          if(value != null) {
              return new Response(value, {headers: { "Content-Type": "text/plain;charset=utf8" }})
          }
          else {
              return new Response('Error: Paste not found',  {headers: { "Content-Type": "text/plain;charset=utf8" }});
          }
      }
  } else {
      if(request.method === "GET") {
          const uuid = pathname.split('/')[1];
          const { value, metadata } = await PASTE_DB.getWithMetadata(uuid);
          if(value != null) {
              return new Response(renderHTML({uuid: uuid, text: value, country: metadata.country, createdAt: metadata.createdAt, expiration: metadata.expiration, title: metadata.title, timezone: request.cf.timezone}),  {headers: { "Content-Type": "text/html;charset=utf8" }});
          }
          else {
              return new Response(renderError({message: "Paste not found"}),  {headers: { "Content-Type": "text/html;charset=utf8" }});
          }
      }
  }

}