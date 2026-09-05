import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  ShuffleIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { DesignSummary } from '@/lib/designs';
import { cn } from '@/lib/utils';

interface Props {
  designs: DesignSummary[];
  currentSlug: string;
  currentIndex: number;
  previousSlug: string;
  nextSlug: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  month: 'short',
  year: 'numeric',
});

/**
 * Don't hijack keys while someone is typing, or while focus sits inside a
 * design that wants them for itself (`data-captures-keys`) — the pixel-quest
 * game steers with the arrow keys.
 */
function shouldIgnoreKey(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return true;
  return target.closest('[data-captures-keys]') !== null;
}

const buttonClass =
  'inline-flex size-9 cursor-pointer items-center justify-center rounded-full ' +
  'text-white/90 transition-colors hover:bg-white/15 hover:text-white ' +
  'focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none';

export default function DesignChrome({
  designs,
  currentSlug,
  currentIndex,
  previousSlug,
  nextSlug,
}: Props) {
  const [open, setOpen] = useState(false);

  const current = useMemo(
    () => designs.find((design) => design.slug === currentSlug),
    [designs, currentSlug],
  );

  // Newest first in the palette — it matches the gallery.
  const ordered = useMemo(() => designs.toReversed(), [designs]);

  const go = useCallback((slug: string) => {
    window.location.href = `/designs/${slug}`;
  }, []);

  const goRandom = useCallback(() => {
    const others = designs.filter((design) => design.slug !== currentSlug);
    const pick = others[Math.floor(Math.random() * others.length)] ?? current;
    if (pick) go(pick.slug);
  }, [current, currentSlug, designs, go]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPaletteKey =
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') ||
        (event.key === '`' &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey);

      if (isPaletteKey) {
        // A bare backtick must still be typeable in a field — but once the
        // palette is open, every shortcut closes it again.
        if (!open && event.key === '`' && shouldIgnoreKey(event.target)) return;
        event.preventDefault();
        setOpen((wasOpen) => !wasOpen);
        return;
      }

      if (open || event.metaKey || event.ctrlKey || event.altKey) return;
      if (shouldIgnoreKey(event.target)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(previousSlug);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(nextSlug);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [go, nextSlug, open, previousSlug]);

  return (
    <>
      <nav
        data-design-chrome
        data-open={open ? '' : undefined}
        aria-label="Design navigation"
        className={cn(
          'fixed bottom-4 left-1/2 z-50 -translate-x-1/2',
          'flex items-center gap-1 rounded-full p-1.5',
          'border border-white/15 bg-black/55 backdrop-blur-md',
          'shadow-lg shadow-black/40 select-none',
          // Recede until wanted — but stay put on touch devices, for reduced
          // motion, while the palette is open, and whenever focus is inside.
          'opacity-30 transition-opacity duration-300',
          'hover:opacity-100 focus-within:opacity-100 data-[open]:opacity-100',
          '[@media(hover:none)]:opacity-100',
          'motion-reduce:opacity-100 motion-reduce:transition-none',
        )}
      >
        <a
          href={`/designs/${previousSlug}`}
          className={buttonClass}
          aria-label="Previous design"
          title="Previous design (←)"
        >
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </a>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'flex h-9 min-w-[9rem] cursor-pointer items-center justify-center gap-2',
            'rounded-full px-4 text-sm font-medium text-white/90 transition-colors',
            'hover:bg-white/15 hover:text-white',
            'focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none',
          )}
          aria-label="Choose a design"
          title="Choose a design (⌘K)"
        >
          <span className="truncate">{current?.name ?? 'Designs'}</span>
          <span className="text-[0.7rem] text-white/50 tabular-nums">
            {currentIndex + 1}/{designs.length}
          </span>
        </button>

        <a
          href={`/designs/${nextSlug}`}
          className={buttonClass}
          aria-label="Next design"
          title="Next design (→)"
        >
          <ChevronRightIcon className="size-5" aria-hidden="true" />
        </a>

        <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />

        <button
          type="button"
          onClick={goRandom}
          className={buttonClass}
          aria-label="Random design"
          title="Random design"
        >
          <ShuffleIcon className="size-4" aria-hidden="true" />
        </button>

        <a
          href="/designs"
          className={buttonClass}
          aria-label="All designs"
          title="All designs"
        >
          <LayoutGridIcon className="size-4" aria-hidden="true" />
        </a>
      </nav>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Designs"
        description="Search every design this homepage has worn."
        className={cn(
          'sm:max-w-lg',
          'border-white/10 bg-zinc-950 text-zinc-100',
          // shadcn's Command paints `bg-popover` — let the dark dialog show
          // through, so the palette is dark whatever the reader's theme.
          '[&_[data-slot=command]]:bg-transparent',
          '[&_[data-slot=command]]:text-inherit',
          '[&_[cmdk-input-wrapper]]:border-white/10',
          '[&_button[data-slot=dialog-close]]:cursor-pointer',
          '[&_button[data-slot=dialog-close]]:text-zinc-400',
          '[&_button[data-slot=dialog-close]]:hover:text-zinc-100',
        )}
      >
        <CommandInput
          placeholder="Jump to a design…"
          className="text-zinc-100 placeholder:text-zinc-500"
        />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty className="py-8 text-center text-sm text-zinc-500">
            No designs found.
          </CommandEmpty>
          <CommandGroup className="[&_[cmdk-group-heading]]:text-zinc-500">
            {ordered.map((design) => (
              <CommandItem
                key={design.slug}
                value={`${design.name} ${design.tags.join(' ')}`}
                onSelect={() => go(design.slug)}
                className={cn(
                  'cursor-pointer gap-3 px-2! py-1.5! text-zinc-100',
                  'data-[selected=true]:bg-white/10 data-[selected=true]:text-white',
                )}
              >
                <span className="relative aspect-16/10 w-16 shrink-0 overflow-hidden rounded-sm bg-white/5 ring-1 ring-white/10">
                  {design.thumbnail ? (
                    <img
                      src={design.thumbnail}
                      alt=""
                      width={320}
                      height={200}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  ) : null}
                </span>

                <span className="flex-1 truncate">{design.name}</span>

                {design.slug === currentSlug && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] tracking-wide text-zinc-300 uppercase">
                    current
                  </span>
                )}

                <span className="shrink-0 text-xs text-zinc-500 tabular-nums">
                  {dateFormatter.format(new Date(design.date))}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
