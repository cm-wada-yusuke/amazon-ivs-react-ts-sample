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
import React, { ReactElement, useEffect, useState } from 'react';

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

export type AmazonIVSContextOptions = {
  AmazonIVS: React.FC;
  setStreamParam: (stream: string) => void;
};

export type AmazonIVSProviderOptions = {
  children: React.ReactElement;
};

export const AmazonIVSContext = React.createContext(
  {} as AmazonIVSContextOptions,
);

export const useAmazonIVS = () =>
  React.useContext<AmazonIVSContextOptions>(AmazonIVSContext);

const AmazonIVS: React.FC<HTMLVideoElement> = () => (
  <video id="video-player" playsInline controls />
);

export const AmazonIVSProvider: React.FC<AmazonIVSProviderOptions> = (
  options: AmazonIVSProviderOptions,
) => {
  const createAbsolutePath = (assetPath: string) =>
    new URL(assetPath, document.URL).toString();

  const [player, setPlayer] = useState({} as MediaPlayer);
  const [AmazonIVS] = useState(<video playsInline controls />);
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

    const destory = (): void => {
      player.delete();
    };

    const pl = create({
      wasmWorker: createAbsolutePath(wasmWorkerPath),
      wasmBinary: createAbsolutePath(wasmBinaryPath),
    });
    pl.attachHTMLVideoElement(AmazonIVS as any);
    attachListeners(pl);
    setPlayer(pl);

    setStreamParam(
      // refs: https://github.com/aws-samples/amazon-ivs-player-web-sample/blob/582c2981d4668491ba7a9d0258f06fee77dcf447/src/basic.ts#L85
      // This is the "quiz" stream, which contains Timed Metadata. See the README for more sample streams.
      'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8',
    );

    player.setAutoplay(true);
    player.load(streamParam);
  }, [AmazonIVS, AmazonIVS.props, player, setStreamParam, streamParam]);

  return (
    <AmazonIVSContext.Provider
      value={{
        AmazonIVS: (props: any) => AmazonIVS,
        setStreamParam,
      }}
    >
      {options.children}
    </AmazonIVSContext.Provider>
  );
};

export default AmazonIVSProvider;
