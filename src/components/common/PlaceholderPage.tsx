import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface PlaceholderPageProps {
  heading: string;
  subHeading: string;
  description: string;
}

export default function PlaceholderPage({
  heading,
  subHeading,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader heading={heading} subHeading={subHeading} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-dashed">
          <CardContent className="flex min-h-[280px] items-center justify-center p-8">
            <p className="max-w-md text-center text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
