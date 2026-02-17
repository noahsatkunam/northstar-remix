import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/ui/page-hero";

const TermsOfService = () => {
  return (
    <Layout>
      <PageHero
        title="Terms of Service"
        description="Please read these terms carefully before using our services."
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-4 text-muted-foreground">
              By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">2. Use License</h2>
            <p className="mt-4 text-muted-foreground">
              Permission is granted to temporarily access the materials (information or software) on our website for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">3. Disclaimer</h2>
            <p className="mt-4 text-muted-foreground">
              The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">4. Limitations</h2>
            <p className="mt-4 text-muted-foreground">
              In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">5. Accuracy of Materials</h2>
            <p className="mt-4 text-muted-foreground">
              The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete or current.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">6. Links</h2>
            <p className="mt-4 text-muted-foreground">
              We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">7. Modifications</h2>
            <p className="mt-4 text-muted-foreground">
              We may revise these terms of service for our website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">8. Governing Law</h2>
            <p className="mt-4 text-muted-foreground">
              These terms and conditions are governed by and construed in accordance with applicable laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-foreground">Contact Us</h2>
            <p className="mt-4 text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsOfService;
