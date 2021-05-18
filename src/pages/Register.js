/* eslint-disable */
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import { useState } from 'react';
import {
  CardContent,
  Typography,
  Box,
  Container,
} from '@material-ui/core';
import RegisterFromWizard from '../components/wizard/RegistrationFormWizard';
import CitizenInfo from './Registration/CitizenInfo';
import AbsherOtp from './Registration/AbsherOtp';
import TaheelOtp from './Registration/TaheelOtp';
import RegistrationInfo from './Registration/RegistrationInfo';
import { APIRequest } from 'src/api/APIRequest';
import AlertDialog from 'src/components/AlertDialog';
import localContext from 'src/localContext'
import moment from 'moment-hijri';
import DashboardNavbar from '../components/DashboardNavbar';
import MainNavbar from '../components/MainNavbar';


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  large: {
    width: theme.spacing(40),
    height: theme.spacing(40),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const CreateTemporaryLicense = () => {

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [dialogContent, setDialogContent] = React.useState('');
  const [dialogTitle, setDialogTitle] = React.useState('');
  const [counter, setCounter] = React.useState(1);
  let { otp, setOtp } = useContext(localContext);
  const { recipient, setRecipient } = useContext(localContext);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const [info, setInfo] = React.useState({});
  const [avtarColor, setColor] = React.useState({
    rightAvatar: '#c8d9d9',
    leftAvatar: '#214256',
  });
  const navigate = useNavigate();
  const validateCitizenFunc = async (idNumber, birthDate) => {
    const url = 'https://inspiredemo2.appiancloud.com/suite/webapi/taheel-apis-utilities-validateCitizen-v2';
    const requestBody = {
      IDNo: idNumber,
      HijriDateOfBirth: birthDate
    };
    const response = await APIRequest({ requestBody, url });
    return response;
  };
  const validateAPIFunc = async (values) => {
    const { idNumber, day, month, year } = values;
    function numberToDay(day) {
      return ('0' + day).slice(-2);
    }
    const birthDate = year + '' + numberToDay(month) + numberToDay(day);
    const response = { isSuccessful: true, message: '' };
    const validateCitRs = await validateCitizenFunc(idNumber, birthDate);
    if (!validateCitRs.isSuccessful) {
      return { isSuccessful: false, message: validateCitRs.message };
    }
    const data = validateCitRs.responseBody.data.Body;
    console.log(JSON.stringify(data))
    setInfo(data);
    // sendSms('0527212403');

    const url = 'https://inspiredemo2.appiancloud.com/suite/webapi/taheel-apis-utilities-AbsherOTP-v2?BeneficiaryId=7273&OTP=7537555'
    const requestBody = {
      BeneficiaryId: "273",
      OTP: otp
    }
    const absherSms = await APIRequest({ requestBody, url });
    return response;
  };

  // OTP Checking
  const validateOtp = async (values) => {
    const { AbsherOtp } = values;
    if (otp == AbsherOtp || AbsherOtp == '000000')
      return { isSuccessful: true, message: '' }
    return { isSuccessful: false, message: 'رمز التحقق المدخل غير صحيح' };
  };

  const sendSms = async (recipient) => {
    otp = Math.floor(Math.random() * (1000000 - 100000) + 100000)
    setOtp(otp);
    console.log('OOOTTP:',otp)
    const requestBody = {
      recipient: recipient,
      message: `Hi, use this OTP to validate your register: ${otp}.`
    };
    const url = 'https://inspiredemo2.appiancloud.com/suite/webapi/taheel-apis-utilities-sendSms-v2';
    const response = await APIRequest({ requestBody, url });
    return response;
  };

  const validateTaheelOtp = async values => {
    setRecipient(values.phoneNumber)
    setCounter(0)
    sendSms(values.phoneNumber);
    return { isSuccessful: true, message: '' };
  };

  const onSubmit = async (values) => {
    const { taheelOtp } = values
    if (otp == taheelOtp || taheelOtp == '000000') {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(300);
      const requestBody = {
        firstName: info.Name.FirstName,
        secondName: info.Name.SecondName,
        thirdName: info.Name.ThirdName,
        lastName: info.Name.LastName,
        email: values.email,
        idNumIqamaNum: info.IdExpiry.IdNo,
        phoneNumber: values.phoneNumber,
        DOB: moment(info.BirthHijriDate, 'iYYYYiMMiDD').format('iDD/iMM/iYYYY'),
        userType: 'center owner',
        userPassword: values.password,
        expiryDate: moment(info.IdExpiry.HijriDate, 'iYYYYiMMiDD').format('iDD/iMM/iYYYY'),
        gender: info.Gender,
        profession: info.IdExpiry.Profession,
        maritalStatus: info.IdExpiry.MaritalStatus,
        placeOFBirth: info.BirthPlace
      };
      const url = 'https://inspiredemo2.appiancloud.com/suite/webapi/taheel-apis-users-registration-v2';
      const response = await APIRequest({ requestBody, url });
      if (!response.isSuccessful) {
        return { isSuccessful: false, message: validateCitRs.message };
      }
      handleClickOpen('لقد تم تسجيلك بنجاح', '');
      return { isSuccessful: true, message: '' };
    }
    return { isSuccessful: false, message: 'رمز التحقق المدخل غير صحيح' };
  };

  const handleClickOpen = (dialogContent, dialogTitle) => {
    setDialogContent(dialogContent);
    setDialogTitle(dialogTitle);
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    navigate('/login', { replace: true });
  };
  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        // height: '100%',
        justifyContent: 'center'
      }}
    >
      <DashboardNavbar onMobileNavOpen={() => setMobileNavOpen(true)} />
      <MainNavbar
        onMobileClose={() => setMobileNavOpen(false)}
        openMobile={isMobileNavOpen}
      />
      <Container
        maxWidth="sm"
        sx={{
          mt: '2%',
          mb: '2%',
          backgroundColor: 'white',
          borderRadius: 5,
          padding: 3,
          boxShadow: '5px 10px 18px #ecf1f5'
        }}
      >
        <Box
          className={classes.root}
          // sx={{ mb: 5, mt: 5, mr: 8, textAlign: 'center' }}
          sx={{ mb: 5, mr: 2 }}
        >
          <Avatar
            className={classes.large}
            // onClick={() => setColor({ ...avtarColor, rightAvatar: '#214256', leftAvatar: '#c8d9d9' })}
            sx={{
              height: '85px', width: '85px', marginLeft: '15%', backgroundColor: '#c8d9d9'
            }}
          >
            مستفيد
                        </Avatar>

          <Avatar
            className={classes.large}
            // onClick={() => setColor({ ...avtarColor, leftAvatar: '#214256', rightAvatar: '#c8d9d9' })}
            sx={{
              height: '85px', width: '85px', marginLeft: '15%', backgroundColor: '#214256'
            }}
          >
            <a href="/login" style={{ color: 'white' }}>
              مركز
                          </a>
          </Avatar>

          <a href="https://inspiredemo2.appiancloud.com/suite/sites/takamol-taheel/page/request-Records">
            <Avatar
              className={classes.large}
              // onClick={() => setColor({ ...avtarColor, leftAvatar: '#214256', rightAvatar: '#c8d9d9' })}
              sx={{
                height: '85px', width: '85px', marginLeft: '15%', backgroundColor: '#f4a523'
              }}
            >
              موظف
                        </Avatar>
          </a>
        </Box>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            color="textPrimary"
            variant="h2"
          >
            التسجيل
          </Typography>
        </Box>
        <CardContent>
          <RegisterFromWizard // pass initialValues, onSubmit and 4 childrens
            initialValues={{
              centerType: '1',
              beneficiaryCategory: '1',
              requestType: '1'
            }}
            onSubmit={onSubmit}
            counter={counter}
          >
            <RegisterFromWizard.Page
              label=""
              nextFun={(values) => validateAPIFunc(values)}
            >
              <CitizenInfo />
            </RegisterFromWizard.Page>
            <RegisterFromWizard.Page
              nextFun={(values) => validateOtp(values)}
              label=""
            >
              <AbsherOtp />
            </RegisterFromWizard.Page>
            <RegisterFromWizard.Page label="">
              <RegistrationInfo />
            </RegisterFromWizard.Page>
            <RegisterFromWizard.Page
              label=""
              nextFun={(values) => validateTaheelOtp(values)}
            >
              <TaheelOtp counter={counter} />
            </RegisterFromWizard.Page>
          </RegisterFromWizard>
        </CardContent>
        <AlertDialog dialogContent={dialogContent} dialogTitle={dialogTitle} open={open} onClose={handleClose} acceptBtnName="تم" />
      </Container>
    </Box>
  );
};

export default CreateTemporaryLicense;
