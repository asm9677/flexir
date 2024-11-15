import { NextPage } from "next";
import OfferDetails from "@/components/templates/OfferDetails";

interface OfferPageProps {
  params: {
    offerId: string;
  };
}

const Offer: NextPage<OfferPageProps> = ({ params }) => {
  const { offerId } = params;
  
  return <OfferDetails offerId={offerId} />;
};

export default Offer;
