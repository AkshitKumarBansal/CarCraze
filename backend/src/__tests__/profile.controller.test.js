const {
  uploadVerificationDocuments
} = require('../controllers/user/profile.controller');

const User = require('../models/User');

jest.mock('../models/User', () => ({
  findByIdAndUpdate: jest.fn()
}));

describe('Profile identity document uploads', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        userId: '507f1f77bcf86cd799439011'
      },
      files: {
        idDocument: [
          { path: 'uploads/id-document.pdf' }
        ],
        drivingLicense: [
          { path: 'uploads/driving-license.pdf' }
        ]
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('uploads both documents and sets identity status to pending', async () => {
    const submittedAt = new Date();

    User.findByIdAndUpdate.mockResolvedValue({
      identityVerification: {
        idDocumentUrl: 'uploads/id-document.pdf',
        drivingLicenseUrl: 'uploads/driving-license.pdf',
        status: 'pending',
        submittedAt
      }
    });

    await uploadVerificationDocuments(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      req.user.userId,
      {
        $set: {
          'identityVerification.idDocumentUrl':
            'uploads/id-document.pdf',
          'identityVerification.drivingLicenseUrl':
            'uploads/driving-license.pdf',
          'identityVerification.status': 'pending',
          'identityVerification.submittedAt':
            expect.any(Date),
          'identityVerification.reviewedAt': null,
          'identityVerification.reviewedBy': null,
          'identityVerification.rejectionReason': null
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });

  test('rejects upload when the ID document is missing', async () => {
    req.files.idDocument = [];

    await uploadVerificationDocuments(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining(
          'Both an ID Document and a Driving License are required'
        )
      })
    );

    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('rejects upload when the driving licence is missing', async () => {
    req.files.drivingLicense = [];

    await uploadVerificationDocuments(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('rejects upload when the files object is missing', async () => {
    req.files = undefined;

    await uploadVerificationDocuments(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('returns 404 when the user does not exist', async () => {
    User.findByIdAndUpdate.mockResolvedValue(null);

    await uploadVerificationDocuments(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'User not found.'
      })
    );
  });

  test('returns 500 when the database operation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    User.findByIdAndUpdate.mockRejectedValue(
      new Error('Database unavailable')
    );

    await uploadVerificationDocuments(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Server error during document upload.'
      })
    );

    console.error.mockRestore();
  });
});