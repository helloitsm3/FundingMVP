import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useContractRead } from 'wagmi';
import CalcOutcome from '../../components/functional/CalcOutcome';
import { DonateSchema } from '../../util/validator';
import WarningCard from '../../components/cards/WarningCard';
import { useApp } from '../utils/appContext';
import InputRow from '../../components/form/InputRow';
import DonateWrapper from './DonateWrapper';
import donation from '../../abi/donation.json';
import { AbsoluteRight, MainContainer } from '../../components/format/Box';
import Subtitle from '../../components/typography/Subtitle';
import { DonateIcon } from '../../components/icons/Project';
import { MicrofundIcon } from '../../components/icons/Landing';
import { RowCenter } from '../../components/format/Row';

// Donates directly any amount without reward

const FormWrapper = styled.div`
  background: ${(props) => props.theme.colors.gradient};
  border: 1px solid #3c3c3c;
  border-radius: 5px;
  padding: 2rem 5rem 1rem 5rem;
  margin: 9%;
  margin-top: 4%;
  margin-bottom: 4%;
  @media (max-width: 769px) {
    padding: 2rem 1rem 1rem 3rem;
  }
  @media (max-width: 500px) {
    padding: 2rem 1rem 1rem 1rem;
  }
`;

const DonateWithout = ({ pid, currency, bookmarks, currencyAddress, curr, add, home, rid }) => {
  const [multi, setMulti] = useState('');
  const [conn, setConn] = useState('');
  const { appState, setAppState } = useApp();
  const { rewMAmount, rewDAmount } = appState;

  const outcome = useContractRead({
    address: add,
    abi: donation.abi,
    functionName: 'calcOutcome',
    chainId: home,
    args: [pid, rewDAmount],
    watch: true
  });

  const connections = useContractRead({
    address: add,
    abi: donation.abi,
    functionName: 'calcInvolvedMicros',
    chainId: home,
    args: [pid, rewDAmount],
    watch: true
  });

  useEffect(() => {
    setMulti((outcome.data ?? '').toString());
    setConn((connections.data ?? '').toString());
  }, [rewDAmount]);

  const handleChangeD = (e) => {
    setAppState(appState => ({ ...appState, rewDAmount: e.target.value }));
  };

  const handleChangeM = (e) => {
    setAppState(appState => ({ ...appState, rewMAmount: e.target.value }));
  };

  const formik = useFormik({
    initialValues: {
      directDonation: rewDAmount,
      microfund: rewMAmount,
    },
    validationSchema: DonateSchema,
  });

  return (
    <MainContainer>
      <Subtitle text="Choose donation type and pledge any amount" />
      <FormWrapper>
      <RowCenter><InputRow
          id="directDonation"
          name={<><DonateIcon width={50}/></>}
          min={0}
          placeholder="1000"
          onChange={handleChangeD}
          onBlur={formik.handleBlur}
          tooltip={'Donation: Direct pledge to the project. If project is not successful, amount is returned.'}
          currency={currency}
        />          
        <AbsoluteRight><CalcOutcome multi={multi} conn={conn} /></AbsoluteRight>
      </RowCenter>
      <RowCenter>
        <InputRow
          id="microfund"
          name={<><MicrofundIcon width={50}/></>}
          min={0}
          placeholder="1000"
          onChange={handleChangeM}
          onBlur={formik.handleBlur}
          tooltip={
            'Microfund: Anytime someone donates, the same amount is charged from all active microfunds until it is depleted. Non-depleted amount will be returned to you upon project finish.'
          }
          currency={currency}
        />
        </RowCenter>
      </FormWrapper>
      <WarningCard title={'Beware of scammers!'} description={<>Project founders are not obligated to verify their identities to the Eyeseek. Backing is provided on your own risk, it is
            recommended to verify project validity on project website and socials. Do not trust projects without any reference to Eyeseeek
            funding.</>} />
      <DonateWrapper
        pid={pid}
        bookmarks={bookmarks}
        currencyAddress={currencyAddress}
        add={add}
        curr={curr}
        home={home}
        rid={rid}
      />
    </MainContainer>
  );
};

export default DonateWithout;
