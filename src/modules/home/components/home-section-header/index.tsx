// src/modules/home/components/home-section-header/index.tsx
import { useTranslation } from "react-i18next";
import Text from "@modules/common/components/text";

interface Props {
  sectionHeading: string;
}

const HomeSectionHeader: React.FC<Props> = ({ sectionHeading }) => {
  const { t } = useTranslation("common");

  return (
    <div className="home-section-header">
      <Text className="home-section-header-text" variant="mediumHeading">
        {t(sectionHeading)}
      </Text>
    </div>
  );
};

export default HomeSectionHeader;