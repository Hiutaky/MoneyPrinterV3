export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const type = url.searchParams.get("type");
      const prompt = url.searchParams.get("prompt");
  
      const input = {
        prompt: prompt
      };
      if( type === "image") {
        const models = {
          flux: "@cf/black-forest-labs/flux-1-schnell",
          dream: "@cf/lykon/dreamshaper-8-lcm",
          sdlight: "@cf/bytedance/stable-diffusion-xl-lightning",
          sdxl: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        }
  
        const model = models.sdxl;
    
        const response = await env.AI.run(
          model,
          input,
        );
    
        return new Response(response, {
          headers: {
            'content-type': 'image/png',
          },
        });
      } else {
        let response = await env.AI.run('@cf/meta/llama-3.1-70b-instruct', input, {
          max_tokens: 32000
        });
        return new Response(response.response);
      }
    }
};