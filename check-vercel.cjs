const checkVercelCode = async () => {
  try {
    const res = await fetch('https://www.setaradapps.com');
    const html = await res.text();
    const scriptTags = [...html.matchAll(/<script type="module" crossorigin src="([^"]+)"/g)];
    for (const match of scriptTags) {
      const scriptUrl = 'https://www.setaradapps.com' + match[1];
      console.log('Fetching', scriptUrl);
      const scriptRes = await fetch(scriptUrl);
      const scriptText = await scriptRes.text();
      if (scriptText.includes('/upload-video')) {
        console.log('FOUND /upload-video IN', scriptUrl);
      } else {
        console.log('NOT FOUND in', scriptUrl);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
checkVercelCode();
