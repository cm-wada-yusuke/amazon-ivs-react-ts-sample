import {
  registerIVSQualityPlugin,
  registerIVSTech,
  VideoJSEvents,
  VideoJSIVSTech,
  VideoJSQualityPlugin,
} from 'amazon-ivs-player';
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';

// Styles
import 'video.js/dist/video-js.css';

/**
 * These imports are loaded via the file-loader, and return the path to the asset.
 * We use the TypeScript compiler (TSC) to check types; it doesn't know what this WASM module is, so let's ignore the error it throws (TS2307).
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import wasmBinaryPath from 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import wasmWorkerPath from 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js';

export type AmazonIVSOptions = {
  stream: string;
};

function AmazonIVS(options: AmazonIVSOptions) {
  const createAbsolutePath = (assetPath: string) =>
    new URL(assetPath, document.URL).toString();

  const videoEl = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    registerIVSTech(videojs, {
      wasmWorker: createAbsolutePath(wasmWorkerPath),
      wasmBinary: createAbsolutePath(wasmBinaryPath),
    });
    // register the quality plugin
    registerIVSQualityPlugin(videojs);
    // create the player with the appropriate types. We're using @types/video.js VideoJsPlayer, and intersecting our Player and Quality Plugin interface
    const player = videojs(
      'videojs-player',
      {
        techOrder: ['AmazonIVS'],
        autoplay: true,
      },
      function () {
        console.warn('Player is ready to use');
      },
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    player.enableIVSQualityPlugin();

    // listen to IVS specific events
    const events: VideoJSEvents = player.getIVSEvents();
    const ivsPlayer = player.getIVSPlayer();
    ivsPlayer.addEventListener(events.PlayerState.PLAYING, () => {
      console.log('IVS Player is playing');
    });
    player.src(
      'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8',
    );
  }, []);

  return (
    <video
      id="videojs-player"
      ref={videoEl}
      playsInline
      autoPlay
      height={300}
      controls
    />
  );
}

export default AmazonIVS;
