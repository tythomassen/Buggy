import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By downloading, installing, or using the Buggy application ("App"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, do not use the App. Buggy reserves the right to update these Terms at any time without prior notice. Continued use of the App following any changes constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "2. Service Description",
    body: `Buggy is a golf cart ride-sharing platform operating exclusively within the Cape May, New Jersey service area. Buggy connects riders seeking transportation with independent driver-operators ("Drivers"). Buggy does not own or operate any golf carts and is not a transportation carrier. All rides are provided by independent Drivers who are solely responsible for their vehicles and the safe operation thereof.`,
  },
  {
    title: "3. Eligibility",
    body: `You must be at least 18 years of age to create an account and use the App. By using the App you represent and warrant that you meet this requirement. Buggy reserves the right to suspend or terminate accounts found to be in violation of this requirement without notice.`,
  },
  {
    title: "4. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify Buggy immediately of any unauthorized use of your account. Buggy will not be liable for any loss or damage arising from your failure to protect your account information. You may not transfer your account to any other person or entity.`,
  },
  {
    title: "5. Payments & Fees",
    body: `All fares are calculated based on distance, time, and applicable surge pricing. Payment is processed securely through Stripe. By providing payment information you authorize Buggy to charge the applicable fare plus any applicable taxes or fees. All charges are final and non-refundable unless a dispute is filed within 24 hours of the ride. Buggy reserves the right to modify its pricing structure at any time.`,
  },
  {
    title: "6. Cancellations",
    body: `Riders may cancel a ride request at any time prior to Driver acceptance at no charge. Cancellations made after Driver acceptance may be subject to a cancellation fee not to exceed $5.00. Repeated cancellations may result in temporary or permanent suspension of your account.`,
  },
  {
    title: "7. Conduct",
    body: `Users agree to treat Drivers and fellow riders with respect. Any form of harassment, discrimination, or abusive behavior is strictly prohibited and may result in immediate account termination. Users are responsible for any damage caused to a Driver's vehicle during a ride and may be charged accordingly. Consumption of alcohol or illegal substances during a ride is prohibited.`,
  },
  {
    title: "8. Service Area Limitations",
    body: `Buggy operates solely within the defined Cape May, NJ service boundary. Ride requests originating outside this area will not be fulfilled. Buggy makes no guarantee of Driver availability at any given time and shall not be liable for any inconvenience caused by lack of availability.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, Buggy, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the App or any ride facilitated through the App. Buggy's total liability to you for any claim shall not exceed the amount paid by you for the ride giving rise to such claim.`,
  },
  {
    title: "10. Indemnification",
    body: `You agree to indemnify, defend, and hold harmless Buggy and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the App, your violation of these Terms, or your violation of any rights of another person or entity.`,
  },
  {
    title: "11. Privacy",
    body: `Your use of the App is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the App you consent to the collection and use of your information as described in the Privacy Policy. Buggy will not sell your personal information to third parties. Location data is collected solely for the purpose of facilitating ride matching and is not retained beyond the duration of each session.`,
  },
  {
    title: "12. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws of the State of New Jersey, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Cape May County, New Jersey.`,
  },
  {
    title: "13. Contact",
    body: `If you have questions about these Terms, please contact us at legal@ridethebugg.com. Buggy LLC, Cape May, NJ 08204.`,
  },
];

export default function Legal() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-JakartaBold text-gray-900 mb-1">
          Terms & Conditions
        </Text>
        <Text className="text-xs font-Jakarta text-gray-400 mb-6">
          Last updated: April 26, 2026
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} className="mb-6">
            <Text className="text-sm font-JakartaBold text-gray-800 mb-2">
              {s.title}
            </Text>
            <Text className="text-sm font-Jakarta text-gray-600 leading-6">
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
