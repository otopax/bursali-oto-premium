import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';

const components = {
  img: (props) => (
    <span className="block my-6 rounded-xl overflow-hidden shadow-lg border border-white/10 relative w-full h-[400px]">
      <Image
        {...props}
        fill
        style={{ objectFit: 'cover' }}
        alt={props.alt || 'Görsel'}
      />
    </span>
  ),
  h1: (props) => <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 mt-8" {...props} />,
  h2: (props) => <h2 className="text-2xl font-semibold text-accent-gold mb-4 mt-8" {...props} />,
  h3: (props) => <h3 className="text-xl font-medium text-white/90 mb-3 mt-6" {...props} />,
  p: (props) => <p className="text-gray-300 leading-relaxed mb-4 text-[1.05rem]" {...props} />,
  ul: (props) => <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2 pl-4" {...props} />,
  ol: (props) => <ol className="list-decimal list-inside text-gray-300 mb-6 space-y-2 pl-4" {...props} />,
  li: (props) => <li className="text-gray-300" {...props} />,
  strong: (props) => <strong className="text-white font-semibold" {...props} />,
  a: (props) => <a className="text-accent-gold hover:text-white transition-colors duration-200 underline underline-offset-4" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-accent-gold bg-white/5 p-4 my-6 rounded-r-lg italic text-gray-300" {...props} />
  ),
};

export default function MDXRenderer({ content }) {
  return (
    <article className="prose prose-invert max-w-none">
      <MDXRemote source={content} components={components} />
    </article>
  );
}
