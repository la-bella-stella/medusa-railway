import { useTranslation } from "react-i18next";
import Text from "@modules/common/components/text";
import cn from "classnames";

interface Props {
  sectionHeading: string;
  className?: string;
}

const HomeSectionHeader: React.FC<Props> = ({
  sectionHeading,
  className = "",
}) => {
  const { t } = useTranslation("common");

  return (
    <div className={cn("home-section-header", className)}>
      <Text className="home-section-header-text font-normal" variant="mediumHeading">
        {t(sectionHeading)}
      </Text>
    </div>
  );
};

export default HomeSectionHeader;