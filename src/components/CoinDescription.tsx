/**
 * Coin description component with read more/less functionality
 */

import { FC, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CoinDetailData } from '@/types/coingecko';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface CoinDescriptionProps {
  description: string;
  links: CoinDetailData['links'];
  categories: string[];
}

export const CoinDescription: FC<CoinDescriptionProps> = ({
  description,
  links,
  categories,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse and clean description HTML safely
  const cleanDescription = (() => {
    if (typeof window === 'undefined') {
      // Server-side: strip HTML tags as fallback
      return description.replace(/<[^>]*>/g, '');
    }

    try {
      // Client-side: use DOMParser for safe HTML text extraction
      const parser = new DOMParser();
      const doc = parser.parseFromString(description, 'text/html');
      // Also decode HTML entities like &amp;, &lt;, etc.
      return doc.body.textContent || description.replace(/<[^>]*>/g, '');
    } catch {
      // Fallback to basic stripping if DOMParser fails
      return description.replace(/<[^>]*>/g, '');
    }
  })();

  const isLongDescription = cleanDescription.length > 300;
  const truncatedDescription = isLongDescription
    ? cleanDescription.substring(0, 300) + '...'
    : cleanDescription;

  // Extract useful links
  const homepage = links.homepage.find(url => url);
  const twitter = links.twitter_screen_name
    ? `https://twitter.com/${links.twitter_screen_name}`
    : null;
  const reddit = links.subreddit_url;
  const github = links.repos_url.github.find(url => url);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>About</CardTitle>
        <CardDescription>
          Project information and official links
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => (
              <Badge key={index} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          {isLongDescription ? (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <p className="text-gray-700 dark:text-gray-300">
                {isOpen ? cleanDescription : truncatedDescription}
              </p>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="mt-2 gap-2">
                  {isOpen ? (
                    <>
                      Show less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              {cleanDescription}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          {homepage && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Website
              </a>
            </Button>
          )}
          {twitter && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Twitter
              </a>
            </Button>
          )}
          {reddit && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={reddit}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Reddit
              </a>
            </Button>
          )}
          {github && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                GitHub
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
