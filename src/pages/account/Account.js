import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Card,
  Alert,
  CardContent
} from '@material-ui/core';
import React, { useState } from 'react';
import AccountProfileDetails from './components/AccountProfileDetails';
import { PersonInfoValidate } from './AccountUtils';
import AccountFinalFrom from './components/AccountFinalForm';
import { ownerInfoUpdate, requestOTPPhoneNum } from './data/AccountApi';
import ChangePhonenumberDialog from './components/ChangePhonenumberDialog';
import { getCurrentUser, setCurrentUser } from 'src/utils/UserLocalStorage';

const Account = () => {
  const [dialogContent, setDialogContent] = React.useState('');
  const [errMessage, SetErrMessage] = useState('');
  const [successMessage, SetsuccessMessage] = useState('');
  const [successMessageFromDialog, SetsuccessMessageFromDialog] = useState('');
  const [OTP, setOTP] = useState('');
  const [isDisable, setIsDisable] = useState(false);
  const [num, setNum] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [open, setOpen] = useState(false);
  const { firstName, lastName, email, phoneNumber, idNumIqamaNum } = getCurrentUser();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const onSubmit = async (values) => {
    const response = { isSuccessful: true, message: '' };
    setNum(values.phoneNumber);
    setUpdatedEmail(values.email);
    if (phoneNumber != values.phoneNumber) {
      if (successMessage !== null) {
        SetsuccessMessage('');
      }
      if (errMessage !== null) {
        SetErrMessage('');
      }
      const smsOTPRequest = await requestOTPPhoneNum(values.phoneNumber);
      if (!smsOTPRequest.isSuccessful) {
        SetErrMessage(smsOTPRequest.message);
        return { isSuccessful: false, message: smsOTPRequest.message };
      }
      handleClickOpen();
    } else {
      const ownerInfoUpdateRequest = await ownerInfoUpdate(idNumIqamaNum, values.email, values.phoneNumber, '');
      if (!ownerInfoUpdateRequest.isSuccessful) {
        SetErrMessage(ownerInfoUpdateRequest.message);
        return { isSuccessful: false, message: ownerInfoUpdateRequest.message };
      }
      setCurrentUser({
        ...getCurrentUser(),
        email: values.email,
        phoneNumber: values.phoneNumber,
      });
      SetsuccessMessage('لقد تم حفظ الملف التعريفي بنجاح ');
    }
    return response;
  }
  return (
    <>
      <Helmet>
        <title>Account</title>
      </Helmet>
      <Box
        sx={{
          py: 3
        }}
      >
        <Container maxWidth="md">
          <Card>
            <CardContent >
              {errMessage && (
                <Alert variant="outlined" severity="error">
                  {errMessage}
                </Alert>
              )}
              {successMessage && (
                <Alert variant="outlined" severity="success">
                  {successMessage}
                </Alert>
              )}
              {successMessageFromDialog && (
                <Alert variant="outlined" severity="success">
                  {successMessageFromDialog}
                </Alert>
              )}
              <AccountFinalFrom // pass initialValues, onSubmit and 4 childrens
                initialValues={{
                  disabledBackButt: true,
                  lastPageErrorHandling: false,
                  agree: [false],
                }}
                isDisable={isDisable}
                OTP={OTP}
                onSubmit={onSubmit}
              >
                <AccountFinalFrom.Page
                  label=""
                  validate={PersonInfoValidate}
                >
                  <AccountProfileDetails data={{ firstName: firstName, lastName: lastName, email: email, phoneNumber: phoneNumber, idNumIqamaNum: idNumIqamaNum }} setIsDisable={setIsDisable} SetErrMessage={SetErrMessage}
                  />
                </AccountFinalFrom.Page>
              </AccountFinalFrom>
            </CardContent>
            <ChangePhonenumberDialog data={{ firstName: firstName, lastName: lastName, email: updatedEmail, phoneNumber: num, idNumIqamaNum: idNumIqamaNum }} setOTP={setOTP} dialogContent={dialogContent} SetsuccessMessageFromDialog={SetsuccessMessageFromDialog} open={open} onClose={handleClose} />
          </Card>
        </Container>
      </Box>
    </>
  )
}
export default Account;