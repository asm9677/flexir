import OfferDetails from "@/components/templates/OfferDetails";

interface OfferPageProps {
  params: {
    offerId: string;
  };
}

const OfferPage = ({ params }: OfferPageProps) => {
  console.log(params)
  const { offerId } =  params;

  return <OfferDetails offerId={offerId} />;
};

export default OfferPage;
