import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppBar } from '@/features/account/AppBar';
import { supportTopic } from '@/features/account/supportTopics';
import { requireCustomer } from '@/lib/auth/session';

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const t = supportTopic((await params).topic);
  return { title: t ? `${t.title} | پشتیبانی` : 'پشتیبانی' };
}

/** Topic guidance (design 30) with the next step: pick an order, or write the request directly. */
export default async function SupportTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const topic = supportTopic((await params).topic);
  if (!topic) notFound();
  await requireCustomer(`/my-account/support/topics/${topic.key}/`);
  const next = topic.needsOrder ? `/my-account/support/select-order/?topic=${topic.key}` : `/my-account/support/new/?topic=${topic.key}`;
  return (
    <div className="flex min-h-[calc(100dvh-90px)] flex-col lg:min-h-0">
      <AppBar title={topic.title} backHref="/my-account/support/" />
      <dl className="flex-1 space-y-5 py-5">
        {topic.faq.map((f) => (
          <div key={f.q}>
            <dt className="font-bold text-text">{f.q}</dt>
            <dd className="mt-1.5 text-xs leading-6 text-text-muted">{f.a}</dd>
          </div>
        ))}
      </dl>
      <div className="sticky bottom-0 bg-surface py-4 lg:static">
        <Link href={next} className="flex h-12 w-full items-center justify-center rounded-md bg-primary text-base font-bold text-primary-on hover:bg-primary-hover lg:w-60">
          {topic.needsOrder ? 'انتخاب سفارش' : 'ثبت درخواست'}
        </Link>
      </div>
    </div>
  );
}
