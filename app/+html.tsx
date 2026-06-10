import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

const FAVICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0RjQ2RTUiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48ZWxsaXBzZSBjeD0iMTYiIGN5PSIxNiIgcng9IjUuNSIgcnk9IjExIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iNSIgeTE9IjE2IiB4Mj0iMjciIHkyPSIxNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTYuNSwxMSBBMTEsNCAwIDAsMSAyNS41LDExIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9Ii44Ii8+PHBhdGggZD0iTTYuNSwyMSBBMTEsNCAwIDAsMCAyNS41LDIxIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9Ii44Ii8+PC9zdmc+'

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Countries &amp; Capitals — Geography Quiz</title>
        <meta name="description" content="Test your knowledge of world capitals. 196 countries, three difficulty levels." />
        <meta property="og:title" content="Countries &amp; Capitals — Geography Quiz" />
        <meta property="og:description" content="Test your knowledge of world capitals. 196 countries, three difficulty levels." />
        <meta property="og:type" content="website" />
        <ScrollViewStyleReset />
        <link rel="icon" type="image/svg+xml" href={FAVICON} />
      </head>
      <body>{children}</body>
    </html>
  )
}
