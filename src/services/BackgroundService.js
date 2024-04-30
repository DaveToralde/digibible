
class BackgroundService {
    BG_CUSTOM_URL = "BG_CUSTOM_URL"
    getGdriveShareLinkRegex =
        ".*drive\\.google\\.com\\/file\\/d\\/" // GDrive share link start
        + "(.*)" // book
        + "\\/.*" // everything else after

    async processUrl(url) {
        let processedUrl = url

        if (url.match(this.getGdriveShareLinkRegex)) {
            processedUrl = this.gdriveLinkToUrl(processedUrl)
        }

        await this.validateUrl(processedUrl)

        return processedUrl
    }
    validateUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    gdriveLinkToUrl(gdriveLink) {
        let gdriveRegexLink =
            ".*drive\\.google\\.com\\/file\\/d\\/" // GDrive share link start
            + "(.*)" // book
            + "\\/.*" // everything else after

        let matchGroups = gdriveLink.match(gdriveRegexLink)
        if (matchGroups) {
            return 'https://drive.google.com/uc?id=' + matchGroups[1]
        }
        return ''
    }
}

export const backgroundService = new BackgroundService();
