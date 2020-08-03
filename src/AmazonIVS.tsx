import {
  create,
  MediaPlayer,
  PlayerError,
  PlayerEventType,
  PlayerState,
  Quality,
  TextCue,
  TextMetadataCue,
} from 'amazon-ivs-player';
import * as ivs from 'amazon-ivs-player';
import React, { useEffect, useRef, useState } from 'react';

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
  const [player, setPlayer] = useState({} as MediaPlayer);
  const [streamParam, setStreamParam] = useState('');
  useEffect(() => {
    // refs: https://github.com/aws-samples/amazon-ivs-player-web-sample/blob/582c2981d4668491ba7a9d0258f06fee77dcf447/src/basic.ts#L52
    function attachListeners(player: MediaPlayer): void {
      for (const state of Object.values(PlayerState)) {
        player.addEventListener(state, () => {
          console.log(state);
        });
      }

      player.addEventListener(PlayerEventType.INITIALIZED, () => {
        console.log('INITIALIZED');
      });

      player.addEventListener(PlayerEventType.ERROR, (error: PlayerError) => {
        console.error('ERROR', error);
      });

      player.addEventListener(
        PlayerEventType.QUALITY_CHANGED,
        (quality: Quality) => {
          console.log('QUALITY_CHANGED', quality);
        },
      );

      // This event fires when text cues are encountered, such as captions or subtitles
      player.addEventListener(PlayerEventType.TEXT_CUE, (cue: TextCue) => {
        console.log('TEXT_CUE', cue.startTime, cue.text);
      });

      // This event fires when embedded Timed Metadata is encountered
      player.addEventListener(
        PlayerEventType.TEXT_METADATA_CUE,
        (cue: TextMetadataCue) => {
          console.log('Timed metadata', cue.text);
        },
      );
    }

    const pl = create({
      wasmWorker: createAbsolutePath(wasmWorkerPath),
      wasmBinary: createAbsolutePath(wasmBinaryPath),
    });
    console.log(pl);

    setPlayer(pl);

    if (videoEl && videoEl.current) {
      console.log('きてる？');
      pl.attachHTMLVideoElement(videoEl.current);
      attachListeners(pl);
      setPlayer(pl);

      setStreamParam(
        // refs: https://github.com/aws-samples/amazon-ivs-player-web-sample/blob/582c2981d4668491ba7a9d0258f06fee77dcf447/src/basic.ts#L85
        // This is the "quiz" stream, which contains Timed Metadata. See the README for more sample streams.
        'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8',
      );

      pl.setAutoplay(true);
      pl.load(
        'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.XFAcAcypUxQm.m3u8',
      );
    }

    // return (): void => {
    //   if (player) {
    //     player.delete();
    //   }
    // };
  }, []);

  return (
    <video
      id="video-player"
      ref={videoEl}
      playsInline
      autoPlay
      height={300}
      controls
    />
  );
}

export default AmazonIVS;
