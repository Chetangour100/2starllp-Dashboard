import { motion } from "framer-motion";

interface PageHeaderProps {
  heading: string;
  subHeading?: string;
}

const PageHeader = ({ heading, subHeading }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {subHeading && (
          <p className="text-muted-foreground">{subHeading}</p>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;
