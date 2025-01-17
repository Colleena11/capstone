import { AuthenticityCheck } from '../../components/ArtValidation/AuthenticityCheck';
import { CopyrightCheck } from '../../components/ArtValidation/CopyrightCheck';

export class ArtVerificationService {
    private authenticityCheck = new AuthenticityCheck();
    private copyrightCheck = new CopyrightCheck();

    async verifyArt(artId: string): Promise<boolean> {
        const authenticityResult = await this.authenticityCheck.checkAuthenticity(artId);
        const copyrightResult = await this.copyrightCheck.checkCopyright(artId);
        return authenticityResult && !copyrightResult;
    }
}
