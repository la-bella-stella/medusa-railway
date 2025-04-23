// src/modules/home/components/home-section-header/index.tsx
import { useTranslation } from "react-i18next";
import Text from "@modules/common/components/text";
import cn from "classnames";

interface Props {
  sectionHeading: string;
  className?: string; // Added className prop
}

const HomeSectionHeader: React.FC<Props> = ({
  sectionHeading,
  className = "", // Default to empty string
}) => {
  const { t } = useTranslation("common");

  return (
    <div className={cn("home-section-header", className)}>
      <Text className="home-section-header-text" variant="mediumHeading">
        {t(sectionHeading)}
      </Text>
    </div>
  );
};

export default HomeSectionHeader;