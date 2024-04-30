const isDeployLocal = process.env.DEPLOY_LOCAL === 'true';

module.exports = {
  publicPath: isDeployLocal ? '/' : (process.env.NODE_ENV === 'production' ? '/verse/' : '/')
};
