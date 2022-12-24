import fs, { Stats } from 'fs';

import { Dropzone, Flex, useShowError } from '@chia-network/core';
import { Trans, t } from '@lingui/macro';
import { Box, Card, Typography } from '@mui/material';
import React, { useState } from 'react';

import usePaste from '../../hooks/usePaste';
import { isMac } from '../../util/utils';

function parseSignedMessageData(text: string): { message: string; signature: string; pubkey: string } {
  const message = text.match(/Message: (.*)/)?.[1];
  const pubkey = text.match(/Public Key: (.*)/)?.[1];
  const signature = text.match(/Signature: (.*)/)?.[1];

  if (!message || !pubkey || !signature) {
    throw new Error('Invalid signed message data');
  }

  // If message contains only hex characters, convert to utf8
  if (/^[0-9a-fA-F]+$/.test(message)) {
    const hex = message;
    const utf8 = Buffer.from(hex, 'hex').toString('utf8');
    return { message: utf8, pubkey, signature };
  }

  return { message, pubkey, signature };
}

function Background(props) {
  const { children } = props;
  return (
    <Box position="relative" p={3}>
      <Box
        position="absolute"
        left={0}
        right={0}
        top={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginY={-2}
      />
      {children}
    </Box>
  );
}

export type VerifyMessageImportProps = {
  onImport: (imported: { message: string; signature: string; pubkey: string }) => void;
};

export default function VerifyMessageImport(props: VerifyMessageImportProps) {
  const { onImport } = props;
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const showError = useShowError();

  async function handleOpen(path: string) {
    async function continueOpen(stats: Stats) {
      try {
        if (stats.size > 10 * 1024 * 1024) {
          throw new Error(t`Signed message file is too large (> 10MB)`);
        }

        const data = fs.readFileSync(path, 'utf8');

        const parsed = parseSignedMessageData(data);
        onImport(parsed);
      } catch (e) {
        showError(e);
      } finally {
        setIsParsing(false);
      }
    }

    setIsParsing(true);

    fs.stat(path, (err, stats) => {
      if (err) {
        showError(err);
        setIsParsing(false);
      } else {
        continueOpen(stats);
      }
    });
  }

  async function handleDrop(acceptedFiles: [File]) {
    if (acceptedFiles.length !== 1) {
      showError(new Error('Please drop one offer file at a time'));
    } else {
      handleOpen(acceptedFiles[0].path);
    }
  }

  function pasteParse(text: string) {
    try {
      setIsParsing(true);
      const parsed = parseSignedMessageData(text);
      onImport(parsed);
    } catch (e) {
      showError(e);
    } finally {
      setIsParsing(false);
    }
  }

  usePaste({ callback: pasteParse });

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <Dropzone maxFiles={1} onDrop={handleDrop} processing={isParsing} background={Background}>
        <Flex flexDirection="column" alignItems="center">
          <Typography color="textSecondary" variant="h6" textAlign="center">
            <Trans>
              Drag & Drop a Signed Message File,
              <br />
              Paste{' '}
            </Trans>
            {isMac() ? <Trans>(⌘V) signature data</Trans> : <Trans>(Ctrl-V) signature data</Trans>}
          </Typography>
          <Typography color="textSecondary" textAlign="center">
            <Trans>
              or <span style={{ color: '#5ECE71' }}>browse</span> on your computer
            </Trans>
          </Typography>
        </Flex>
      </Dropzone>
    </Card>
  );
}
