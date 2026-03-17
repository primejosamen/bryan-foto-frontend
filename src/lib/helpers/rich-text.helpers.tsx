/**
 * Renders Strapi v5 Rich Text (Blocks) content into React elements.
 *
 * @module lib/helpers/rich-text
 */

import React from 'react';
import type { StrapiBlock, StrapiBlockChild } from '@/models';

/** Render an array of Strapi rich text blocks */
export function renderBlocks(blocks: StrapiBlock[] | undefined): React.ReactNode {
  if (!blocks || blocks.length === 0) return null;

  return blocks.map((block, i) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={i} style={{ marginBottom: '1em', lineHeight: 1.7 }}>
            {renderChildren(block.children)}
          </p>
        );
      case 'heading': {
        const level = block.level ?? 2;
        const headingProps = {
          key: i,
          style: {
            marginBottom: '0.6em',
            fontWeight: 600,
            lineHeight: 1.3,
          },
        };
        const children = renderChildren(block.children);
        if (level === 1) return <h1 {...headingProps}>{children}</h1>;
        if (level === 3) return <h3 {...headingProps}>{children}</h3>;
        if (level === 4) return <h4 {...headingProps}>{children}</h4>;
        if (level === 5) return <h5 {...headingProps}>{children}</h5>;
        if (level === 6) return <h6 {...headingProps}>{children}</h6>;
        return <h2 {...headingProps}>{children}</h2>;
      }
      case 'list':
        return (
          <ul key={i} style={{ marginBottom: '1em', paddingLeft: '1.5em' }}>
            {block.children.map((li, j) => (
              <li key={j}>{renderChildren(li.children ?? [])}</li>
            ))}
          </ul>
        );
      default:
        return (
          <p key={i} style={{ marginBottom: '1em', lineHeight: 1.7 }}>
            {renderChildren(block.children)}
          </p>
        );
    }
  });
}

function renderChildren(children: StrapiBlockChild[]): React.ReactNode {
  return children.map((child, i) => {
    if (child.type === 'text') {
      let node: React.ReactNode = child.text ?? '';
      if (child.bold) node = <strong key={i}>{node}</strong>;
      if (child.italic) node = <em key={i}>{node}</em>;
      if (child.underline) node = <u key={i}>{node}</u>;
      return node;
    }

    if (child.type === 'link' && child.url) {
      return (
        <a
          key={i}
          href={child.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline' }}
        >
          {renderChildren(child.children ?? [])}
        </a>
      );
    }

    return child.text ?? null;
  });
}
