jest.mock('pinata', () => {
  return {
    PinataSDK: jest.fn().mockImplementation(() => ({
      upload: {
        public: {
          file: jest.fn().mockReturnValue({
            cid: 'imageCid',
          }),
          json: jest.fn().mockReturnValue({
            cid: 'metadataCid',
          }),
        },
      },
    })),
  };
});
