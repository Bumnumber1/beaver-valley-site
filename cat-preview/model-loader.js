const MIME = 'model/gltf-binary';

function progressStream(body, report) {
  const reader = body.getReader();
  return new ReadableStream({
    async pull(controller) {
      try {
        const {value, done} = await reader.read();
        if (done) controller.close();
        else { report(value.byteLength); controller.enqueue(value); }
      } catch (error) { controller.error(error); }
    },
    cancel(reason) { return reader.cancel(reason); }
  });
}

async function fallbackBlob(response, report) {
  const {Gunzip, gunzipSync} = await import('./vendor/fflate.js');
  if (typeof ReadableStream !== 'function' || !response.body || typeof response.body.getReader !== 'function') {
    const bytes = new Uint8Array(await response.arrayBuffer());
    report(bytes.byteLength);
    return new Blob([gunzipSync(bytes)], {type: MIME});
  }
  const reader = response.body.getReader();
  let inflater;
  const stream = new ReadableStream({
    start(controller) {
      inflater = new Gunzip((chunk, final) => {
        if (chunk.byteLength) controller.enqueue(chunk);
        if (final) controller.close();
      });
    },
    async pull(controller) {
      try {
        const {value, done} = await reader.read();
        if (done) inflater.push(new Uint8Array(0), true);
        else { report(value.byteLength); inflater.push(value, false); }
      } catch (error) {
        controller.error(error);
        reader.cancel(error).catch(() => {});
      }
    },
    cancel(reason) { return reader.cancel(reason); }
  });
  return new Response(stream, {headers: {'Content-Type': MIME}}).blob();
}

export async function loadModelBlob(url, model, onProgress = () => {}) {
  let received = 0;
  const report = size => { received += size; onProgress(received, model.bytes); };
  const download = async (retry = false) => {
    const response = await fetch(url, retry ? {cache: 'force-cache'} : undefined);
    if (!response.ok) throw new Error('Model download HTTP ' + response.status);
    return response;
  };
  let response = await download();
  let blob;
  if (model.compression !== 'gzip') blob = await response.blob();
  else {
    if (typeof ReadableStream === 'function' && typeof DecompressionStream === 'function' && response.body && typeof response.body.pipeThrough === 'function') {
      let input;
      try {
        input = progressStream(response.body, report);
        const stream = input.pipeThrough(new DecompressionStream('gzip'));
        blob = await new Response(stream, {headers: {'Content-Type': MIME}}).blob();
      } catch (error) {
        // Some Safari releases expose the API but reject valid gzip streams.
        // Fetch a fresh body; retaining a cloned 60 MB response would increase memory use.
        if (input && !input.locked) await input.cancel(error).catch(() => {});
        received = 0;
        onProgress(0, model.bytes);
        response = await download(true);
      }
    }
    if (!blob) blob = await fallbackBlob(response, report);
  }
  if (model.expandedBytes && blob.size !== model.expandedBytes) throw new Error('Incomplete model download');
  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  if (header[0] !== 0x67 || header[1] !== 0x6c || header[2] !== 0x54 || header[3] !== 0x46) throw new Error('Invalid 3D model');
  return blob;
}
