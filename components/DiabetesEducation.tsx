import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiabetesEducationProps {
  isDark?: boolean;
}

const { width } = Dimensions.get('window');

const categories = [
  {
    id: 'basics',
    title: 'Diabetes Basics',
    icon: '📚',
    color: '#2196f3',
    articles: [
      {
        title: 'What is Diabetes?',
        content: `Diabetes is a chronic condition where your body either doesn't make enough insulin or can't use it properly. When you eat, your body breaks down food into glucose (sugar), which enters your bloodstream. Insulin, a hormone made by your pancreas, acts like a key that lets glucose into your cells to use as energy.

When someone has diabetes, this system doesn't work right. Without enough insulin or insulin resistance, glucose builds up in your blood instead of going into cells. Over time, high blood sugar can damage blood vessels, nerves, and organs.

There are several types:
• Type 1: Your body doesn't make insulin. Usually diagnosed in kids and young adults, though it can happen at any age.
• Type 2: Your body doesn't use insulin well (insulin resistance). This is the most common type and often develops in adults, though more teens are getting it now due to obesity.
• Gestational: Happens during pregnancy and usually goes away after birth, but increases risk of Type 2 later.
• Prediabetes: Blood sugar is higher than normal but not high enough to be diabetes yet.

The good news? Diabetes can be managed with the right tools, medications, diet, and lifestyle changes. Many people with diabetes live full, healthy lives.`,
        readTime: '3 min'
      },
      {
        title: 'Understanding Blood Sugar',
        content: `Blood sugar (glucose) is basically fuel for your body. Every cell needs it to work properly, especially your brain. When you eat carbs - bread, pasta, fruit, candy - your body breaks them down into glucose.

Normal blood sugar ranges:
• Fasting (before meals): 70-100 mg/dL
• After meals (2 hours): less than 140 mg/dL
• For people with diabetes, targets might be slightly different

When blood sugar gets too low (hypoglycemia, below 70):
You might feel shaky, sweaty, confused, or dizzy. This can happen if you take too much medication, skip meals, or exercise more than usual. Quick fix: eat 15g of fast-acting carbs like juice or glucose tablets.

When it's too high (hyperglycemia, over 180):
You might feel thirsty, tired, or need to pee a lot. This happens when you eat too much, don't take enough medication, or you're sick or stressed.

The key is finding balance. Your blood sugar naturally goes up and down throughout the day based on what you eat, how active you are, stress levels, and even sleep. That's why checking it regularly helps you understand YOUR patterns.`,
        readTime: '4 min'
      },
      {
        title: 'Types of Diabetes',
        content: `Let's break down the main types:

TYPE 1 DIABETES
Your immune system attacks the cells in your pancreas that make insulin, so you make little to none. Nobody knows exactly why this happens - it's not caused by eating too much sugar or anything you did. About 5-10% of people with diabetes have Type 1.

What you need to know:
- Requires insulin injections or a pump
- Usually diagnosed in childhood but can happen at any age
- Often comes on quickly with severe symptoms
- Can't be prevented (yet)

TYPE 2 DIABETES
Your body becomes resistant to insulin or doesn't make enough. Think of it like your cells ignoring insulin's "knock on the door." About 90-95% of people with diabetes have Type 2.

What you need to know:
- Often manageable with lifestyle changes, pills, and sometimes insulin
- Usually develops slowly over years
- Risk factors include family history, weight, inactivity, and age
- Can sometimes be reversed or put in remission with major lifestyle changes

GESTATIONAL DIABETES
Shows up during pregnancy when hormones make it harder for insulin to work. Usually goes away after delivery but means higher risk of Type 2 later.

PREDIABETES
Blood sugar is higher than normal (100-125 mg/dL fasting) but not diabetic levels yet. About 1 in 3 Americans have it, and most don't know. The good thing is you can prevent or delay Type 2 with lifestyle changes.`,
        readTime: '5 min'
      }
    ]
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Diet',
    icon: '🍎',
    color: '#4caf50',
    articles: [
      {
        title: 'Carb Counting Made Simple',
        content: `Carbs have the biggest impact on blood sugar, so knowing how to count them is super important. But don't worry - it's easier than you think once you get the hang of it.

What counts as a carb?
- Grains: bread, rice, pasta, cereal
- Fruits and fruit juices  
- Milk and yogurt
- Starchy veggies: potatoes, corn, peas
- Sweets and desserts
- Beans and lentils

One serving = about 15g of carbs. Most people aim for 45-60g per meal (3-4 servings).

Quick tips:
• Read nutrition labels - "Total Carbohydrate" is what matters
• Use measuring cups at first until you can eyeball portions
• The "plate method" is easier for some: fill 1/2 plate with non-starchy veggies, 1/4 with protein, 1/4 with carbs
• Restaurant portions are usually 2-3x what you need

Common portion sizes:
- 1 slice of bread = 15g
- 1/2 cup cooked rice/pasta = 15g  
- 1 small apple = 15g
- 1 cup milk = 12g
- 1/2 banana = 15g

Pro tip: Pairing carbs with protein or fat slows down absorption. So peanut butter on toast will spike your blood sugar less than toast alone.

Don't stress about being perfect. Start by just being aware of your carb intake, then get more precise as you learn what works for your body.`,
        readTime: '6 min'
      },
      {
        title: 'Glycemic Index Guide',
        content: `The glycemic index (GI) ranks foods by how fast they raise your blood sugar. Lower GI = slower, steadier rise. Higher GI = quick spike.

Low GI (55 or less) - Best choices:
- Most fruits and veggies
- Whole grains (oatmeal, brown rice, quinoa)
- Beans and lentils
- Nuts
- Sweet potatoes

Medium GI (56-69) - Okay in moderation:
- Whole wheat bread
- Brown rice (yes, it's medium!)
- Corn
- Bananas
- Raisins

High GI (70+) - Eat sparingly:
- White bread and bagels
- White rice
- Most breakfast cereals
- Potatoes (especially baked)
- Watermelon
- Sugary snacks

But here's the thing - GI isn't everything. A food's GI changes based on:
- What else you eat with it (adding fat or protein lowers GI)
- How it's cooked (al dente pasta has lower GI than mushy)
- Ripeness (ripe bananas have higher GI than green ones)
- Processing (instant oatmeal spikes faster than steel cut)

Real world example: White bread has high GI, but if you make a sandwich with turkey, cheese, and veggies, the overall meal has a lower GI.

My advice? Don't obsess over GI numbers. Just remember: whole foods > processed foods. The closer to how it grows in nature, the better.`,
        readTime: '5 min'
      },
      {
        title: 'Meal Planning for Diabetes',
        content: `Meal planning doesn't have to be complicated. The goal is to keep your blood sugar steady throughout the day while still eating food you actually enjoy.

Basic meal planning tips:

EAT REGULARLY
Don't skip meals, especially if you take insulin or certain diabetes meds. Aim for 3 meals plus 1-2 snacks if needed. Going too long without eating can cause low blood sugar.

BALANCE YOUR PLATE
Use the plate method:
- 1/2 non-starchy veggies (leafy greens, broccoli, peppers, etc.)
- 1/4 lean protein (chicken, fish, tofu, eggs)
- 1/4 carbs (brown rice, quinoa, sweet potato)
- Add a small amount of healthy fat (olive oil, avocado, nuts)

PLAN AHEAD
Pick one day a week to plan meals. Make a grocery list. Prep what you can in advance. When you're hungry and unprepared, you'll grab whatever's easy - usually not the healthiest choice.

SMART SNACK IDEAS
- Apple with peanut butter
- Greek yogurt with berries
- Veggies and hummus
- Handful of nuts
- Cheese and whole grain crackers

EATING OUT TIPS
- Check the menu online beforehand
- Ask for dressings/sauces on the side
- Substitute fries for a salad or veggies
- Split an entree or take half home
- Skip the bread basket

MEAL PREP SHORTCUTS
- Cook big batches of grains and proteins on Sunday
- Pre-chop veggies
- Keep frozen veggies on hand
- Use a slow cooker - dump everything in the morning, dinner's ready when you get home

Remember: Perfect doesn't exist. Some days you'll nail it, some days you'll have pizza. That's life. Just get back on track with your next meal.`,
        readTime: '7 min'
      }
    ]
  },
  {
    id: 'monitoring',
    title: 'Blood Sugar Monitoring',
    icon: '📊',
    color: '#ff9800',
    articles: [
      {
        title: 'When to Check Your Blood Sugar',
        content: `How often you check depends on your diabetes type, medications, and what your doctor recommends. Here's a general guide:

TYPE 1 DIABETES
Usually 4-10 times a day:
- Before each meal
- 2 hours after meals
- Before bed
- Before/during/after exercise
- When you feel symptoms
- Before driving

TYPE 2 (on insulin)
Similar to Type 1, but may be less frequent depending on your regimen. Your doctor will give you a specific schedule.

TYPE 2 (no insulin)
Varies a lot. Some people check daily, others a few times a week. Common times:
- Fasting (first thing in the morning)
- Before and 2 hours after your largest meal
- Before bed

WHY THESE TIMES MATTER

Fasting: Shows your baseline. Should be 80-130 mg/dL for most people with diabetes.

Before meals: Helps you decide if you need to adjust your insulin dose or what you can eat.

2 hours after meals: Shows how that meal affected you. Aim for less than 180 mg/dL. This is really helpful for figuring out which foods spike your blood sugar.

Before bed: Important for avoiding nighttime lows. Should be 100-140 mg/dL.

Before exercise: Prevents dangerous lows during activity. If below 100, have a snack first.

Random checks when you feel "off": Trust your gut. If something feels weird, check your blood sugar.

Pro tip: Keep a log (app or notebook) for a few weeks. You'll start seeing patterns - like "Chinese food always spikes me" or "I'm always low at 3pm." Then you can make adjustments.`,
        readTime: '4 min'
      },
      {
        title: 'Understanding Your Readings',
        content: `Those numbers can be confusing at first. Let's break down what they actually mean.

NORMAL RANGES (for people with diabetes):
- Before meals: 80-130 mg/dL
- 2 hours after meals: Less than 180 mg/dL
- Bedtime: 100-140 mg/dL

But remember - your doctor might give you different targets based on your age, how long you've had diabetes, other health conditions, etc.

WHAT'S ACTUALLY HAPPENING

Low (Hypoglycemia) - Below 70 mg/dL
Your cells aren't getting enough fuel. Treat immediately with 15g fast-acting carbs. Recheck in 15 minutes. If still low, repeat.

Symptoms: Shaking, sweating, confusion, fast heartbeat, feeling anxious or irritable.

In range - 70-180 mg/dL
You're good! This is where you want to be most of the time.

High (Hyperglycemia) - Over 180 mg/dL
Too much sugar in your blood, not enough getting into cells. 

Symptoms: Thirsty, tired, peeing a lot, blurry vision, headache.

What to do:
- 180-250: Drink water, take medication if scheduled, check again in a few hours
- Over 250: Check for ketones (especially Type 1), call doctor if high persists or you have ketones
- Over 300: Call your doctor

Very high - Over 400 mg/dL
This is getting dangerous. Call your doctor or go to urgent care, especially if you have ketones or feel sick.

A1C - THE BIG PICTURE
Your blood sugar checks are snapshots. A1C is like a movie - it shows your average over the past 2-3 months. 
- Below 5.7%: Normal
- 5.7-6.4%: Prediabetes  
- 6.5% or higher: Diabetes
- Target for most people with diabetes: Below 7%

One high reading isn't a disaster. Look for trends. If you're high at the same time every day, that's useful info to adjust your treatment.`,
        readTime: '5 min'
      },
      {
        title: 'Continuous Glucose Monitoring',
        content: `CGMs (continuous glucose monitors) are game-changers. Instead of finger pricks several times a day, a tiny sensor under your skin checks your glucose every few minutes automatically.

HOW IT WORKS
A small sensor (about the size of a quarter) sits just under your skin, usually on your arm or belly. It measures glucose in the fluid between your cells and sends readings to your phone or a receiver. Most sensors last 10-14 days before you replace them.

MAJOR BENEFITS
- See your glucose 24/7 in real time
- Arrows show if you're rising, falling, or steady
- Alerts warn you BEFORE you go too low or high
- See how food, exercise, stress, and sleep affect you
- No more (or way fewer) finger pricks
- Share data with family or your doctor

Popular brands: Dexcom, Freestyle Libre, Guardian

WHO CAN GET ONE?
Most people with Type 1 diabetes can get one covered by insurance. Type 2 on insulin often qualifies too. Even if you don't take insulin, some doctors will prescribe it if you're working on better control.

COST
With insurance: Usually $0-50/month depending on your plan
Without insurance: $200-400/month

THE LEARNING CURVE
First week can be overwhelming - so much data! But you'll quickly start noticing:
- "Oh, I always spike after breakfast"
- "I drop low every day at 2pm"  
- "Stress really does raise my blood sugar"
- "I'm going low overnight and didn't even know"

Tips for success:
- Don't obsess over every little wiggle
- Look for patterns over days, not single readings
- You'll still need to fingerstick sometimes to calibrate or confirm readings
- Keep sensors away from insulin injection sites

Not for everyone: Some people find it anxiety-inducing to see their numbers 24/7. Others love having that much control. It's personal preference.

Worth trying if: You have frequent lows (especially if you don't feel them), your A1C is too high despite trying, or you want more data to optimize your control.`,
        readTime: '6 min'
      }
    ]
  },
  {
    id: 'medications',
    title: 'Medications & Insulin',
    icon: '💊',
    color: '#9c27b0',
    articles: [
      {
        title: 'Understanding Insulin',
        content: `If you're new to insulin, it can seem intimidating. But once you understand the types and how they work, it becomes second nature.

WHY INSULIN?
Type 1: Your pancreas doesn't make insulin, so you have to inject it.
Type 2: You might need it if your body can't make enough or use it properly.

TYPES OF INSULIN

Rapid-acting (Humalog, Novolog, Apidra)
- Starts working: 15 minutes
- Peaks: 1 hour  
- Lasts: 3-4 hours
- Use: Right before meals to cover carbs you're eating

Short-acting (Regular insulin)
- Starts working: 30 minutes
- Peaks: 2-3 hours
- Lasts: 5-8 hours
- Use: 30 min before meals

Intermediate-acting (NPH)
- Starts working: 1-2 hours
- Peaks: 4-6 hours
- Lasts: 12-18 hours  
- Use: Cover glucose between meals and overnight

Long-acting (Lantus, Levemir, Basaglar)
- Starts working: 1-2 hours
- Peaks: None (steady)
- Lasts: Up to 24 hours
- Use: Provides steady baseline insulin all day/night

Ultra-long acting (Tresiba, Toujeo)
- Lasts 36-42 hours
- Even steadier than long-acting

COMMON REGIMENS

Basal-Bolus (most Type 1, some Type 2)
- Long-acting once or twice daily (basal)
- Rapid-acting before each meal (bolus)
- Most flexible, matches how a normal pancreas works

Split-Mixed
- NPH + rapid-acting twice daily
- Less flexible but simpler

Premixed
- Pre-mixed ratios (like 70/30) twice daily
- Easiest but least flexible

INSULIN DELIVERY

Syringes: Old school but cheap. Draw from vial and inject.

Pens: Pre-filled, portable, easier to use. Most common now.

Pumps: Wearable device delivers insulin through a tiny tube under your skin. Can program different rates throughout the day. Great for people who want tight control.

Inhalers: Rapid-acting insulin you breathe in. Not common, has limitations.

STORAGE & SAFETY
- Unopened insulin: Store in fridge
- In-use insulin: Room temp is fine for 28 days
- Never freeze insulin
- Don't use if it looks cloudy (except NPH which is naturally cloudy)
- Rotate injection sites to prevent lumps
- Always check expiration dates

The biggest thing: Don't be afraid to ask questions. Your diabetes educator can show you proper injection technique and help you figure out the right doses.`,
        readTime: '8 min'
      },
      {
        title: 'Oral Diabetes Medications',
        content: `There's a bunch of different pills for Type 2 diabetes. They all work differently, so let's break them down.

METFORMIN (Glucophage)
The first-line medication for most people with Type 2.
How it works: Reduces glucose production in your liver, helps your body use insulin better
Pros: Doesn't cause weight gain, cheap, been around forever so we know it's safe
Cons: Can upset your stomach (take with food), not for people with kidney problems
Typical dose: Start low, work up to 1000-2000mg daily

SULFONYLUREAS (Glipizide, Glyburide, Glimepiride)
How it works: Makes your pancreas release more insulin
Pros: Effective, inexpensive
Cons: Can cause lows, weight gain possible, loses effectiveness over time
Take: Usually before meals

DPP-4 INHIBITORS (Januvia, Tradjenta, Onglyza)
How it works: Helps your body release insulin when blood sugar rises
Pros: Low risk of lows, no weight gain
Cons: Expensive, modest effectiveness
Take: Once daily

SGLT2 INHIBITORS (Jardiance, Farxiga, Invokana)
How it works: Makes your kidneys dump excess glucose into urine
Pros: Weight loss, heart benefits, blood pressure reduction
Cons: Increased UTIs and yeast infections, expensive, dehydration risk
Take: Morning dose

GLP-1 AGONISTS (Ozempic, Trulicity, Victoza)
Technically injections, not pills, but worth mentioning
How it works: Slows digestion, helps pancreas release insulin, reduces appetite
Pros: Major weight loss, heart benefits, very effective
Cons: Expensive, stomach side effects, injectable
Take: Weekly or daily injection

MEGLITINIDES (Prandin, Starlix)
How it works: Quick insulin release from pancreas
Pros: Fast-acting
Cons: Multiple daily doses, can cause lows
Take: Right before each meal

TZDs (Actos, Avandia)
How it works: Helps cells use insulin better
Pros: Effective
Cons: Weight gain, fluid retention, heart risks, takes weeks to work
Less commonly used now

COMBINATION PILLS
Many come pre-combined, like metformin + glipizide. Easier than taking multiple pills.

IMPORTANT STUFF
- Most people start with metformin, then add others if needed
- You might take 2-3 different medications - that's normal
- Side effects often improve after a few weeks
- Never skip doses because you "feel fine" - high blood sugar doesn't always cause symptoms
- Tell your doctor about ALL medications and supplements you take

Generic vs brand name: Generics work just as well and cost way less. Always ask if there's a generic option.`,
        readTime: '6 min'
      },
      {
        title: 'Medication Management Tips',
        content: `Taking medication correctly makes a huge difference. Here's how to stay on track:

SET UP A ROUTINE
Take meds at the same time daily. Link them to something you already do:
- Morning meds with breakfast
- Evening meds when you brush teeth  
- Set phone alarms
- Use a pill organizer

PILL ORGANIZER = LIFESAVER
Get one with AM/PM compartments. Fill it once a week. You'll instantly see if you forgot a dose.

DON'T RUN OUT
Refill prescriptions a few days early so you never miss doses. Set calendar reminders. Some pharmacies offer auto-refills.

STORAGE MATTERS
- Most pills: Cool, dry place (not the bathroom - too humid)
- Insulin: Fridge until opened, then room temp
- Keep meds in original bottles so you remember what they are
- Check expiration dates

UNDERSTAND YOUR MEDS
Know:
- What each pill is for
- When to take it (with food? empty stomach?)
- What side effects to watch for  
- What to do if you miss a dose

MISSED A DOSE?
- If it's within a few hours, take it
- If it's almost time for the next dose, skip it
- NEVER double up
- When in doubt, call your pharmacist

SIDE EFFECTS
Give new meds 2-3 weeks. Many side effects improve. But call your doctor if:
- Severe reactions (rash, breathing trouble)
- Persistent vomiting or diarrhea
- Signs of low blood sugar
- Anything that worries you

DON'T STOP SUDDENLY
Even if you feel better or lose weight. Your body needs consistent treatment. If you want to stop or reduce, talk to your doctor about tapering safely.

TRAVELING?
- Pack twice as much medication as you need
- Keep meds in carry-on, not checked luggage
- Bring prescription info or bottles in case you lose pills
- Account for time zone changes

SAVE MONEY
- Ask for generics
- Check GoodRx or similar apps for coupons
- Some manufacturers offer patient assistance programs
- 90-day supplies are often cheaper than monthly
- Shop around - prices vary wildly between pharmacies

KEEP A LIST
Write down all your meds (name, dose, when you take it). Keep a copy in your wallet and on your phone. Crucial for emergencies or doctor visits.

TALK TO YOUR PHARMACIST
They're incredibly helpful and often easier to reach than your doctor. Ask about:
- Drug interactions
- Best time to take meds
- What to avoid (certain foods, supplements)
- How to manage side effects

Bottom line: Your meds only work if you actually take them consistently. Find a system that works for you and stick with it.`,
        readTime: '5 min'
      }
    ]
  },
  {
    id: 'complications',
    title: 'Preventing Complications',
    icon: '🛡️',
    color: '#f44336',
    articles: [
      {
        title: 'Eye Health and Diabetes',
        content: `High blood sugar can damage the tiny blood vessels in your eyes over time. The good news? Regular checkups and good control can prevent most serious eye problems.

DIABETIC RETINOPATHY
The most common diabetes eye problem. Damaged blood vessels in the retina can leak or grow abnormally.

Early stages: No symptoms! You won't notice anything wrong. This is why eye exams are crucial.

Advanced stages: Blurry vision, dark spots, trouble seeing colors, vision loss.

GLAUCOMA & CATARACTS
People with diabetes are more likely to develop these too. Glaucoma damages the optic nerve. Cataracts cloud your lens.

PREVENTION IS KEY

Get dilated eye exams:
- Type 1: Within 5 years of diagnosis, then yearly
- Type 2: Right away, then yearly
- Pregnant: Before pregnancy and each trimester

Keep blood sugar in range:
Every 1% drop in A1C reduces retinopathy risk by 37%. Good control makes a HUGE difference.

Control blood pressure:
High BP damages eye vessels too. Aim for under 130/80.

Don't smoke:
Smoking doubles your risk of eye problems.

WARNING SIGNS - Call your eye doctor immediately if:
- Sudden vision changes
- Lots of floaters (spots)
- Flashing lights
- Dark curtain over your vision
- Blurry vision that doesn't improve

TREATMENT OPTIONS
Caught early, many eye problems can be treated:
- Laser treatment to seal leaking vessels
- Injections to reduce swelling
- Surgery for advanced cases

The key: Don't skip eye exams even if your vision seems fine. Damage often starts before you notice symptoms. I know one more appointment feels like a hassle, but it's worth it to protect your sight.`,
        readTime: '6 min'
      },
      {
        title: 'Foot Care Essentials',
        content: `People with diabetes need to be extra careful with their feet. High blood sugar damages nerves (neuropathy) and reduces circulation, making it harder to feel injuries and slower to heal.

WHY FEET MATTER SO MUCH
Nerve damage means you might not feel a blister, cut, or sore. Poor circulation means injuries heal slowly and can get infected. Small problems can become serious fast.

DAILY FOOT CHECK ROUTINE
Every single day, look at your feet:
- Check for cuts, blisters, redness, swelling
- Look between toes for cracks or athlete's foot
- Check for ingrown toenails
- Use a mirror or ask someone to help check the bottoms

Call your doctor if you notice:
- Cuts or sores that don't heal
- Warm, red areas (could be infection)
- Thick calluses or corns
- Pain or tingling
- Changes in color or temperature

DAILY CARE TIPS

Wash: Daily with warm (not hot!) water and mild soap. Dry thoroughly, especially between toes.

Moisturize: Use lotion on tops and bottoms (but NOT between toes - too much moisture there causes problems).

Trim nails: Cut straight across, not too short. If you can't reach or see well, get a podiatrist to do it.

FOOTWEAR RULES

Always wear shoes: Even indoors! No barefoot walking, not even at home or the beach.

Check shoes first: Feel inside for pebbles, torn linings, or anything that could cause a blister.

Good fit matters: Shoes should be comfortable immediately, no "breaking in" period. Shop in the afternoon when feet are slightly swollen.

Socks: Clean daily, no tight elastic, seamless if possible. White socks show drainage from unnoticed wounds.

WHAT TO AVOID
- Walking barefoot (ever!)
- Hot water (can't feel if it's too hot)
- Heating pads or hot water bottles on feet
- Removing corns/calluses yourself (use a podiatrist)
- Tight socks or shoes
- Crossing your legs for long periods (restricts circulation)

SEE A PODIATRIST REGULARLY
Especially if you have neuropathy or foot problems. They can:
- Trim nails safely
- Remove calluses properly
- Fit special shoes if needed
- Catch problems early

I know it seems like a lot, but the daily routine takes maybe 2 minutes once it's a habit. Way better than dealing with a serious foot infection or worse.`,
        readTime: '5 min'
      },
      {
        title: 'Heart Health and Diabetes',
        content: `Here's something they don't emphasize enough: Heart disease is the #1 cause of death for people with diabetes. But you're not powerless - there's a LOT you can do to protect your heart.

THE CONNECTION
Diabetes damages blood vessels and increases plaque buildup (atherosclerosis). Over time this can lead to:
- Heart attack
- Stroke  
- Peripheral artery disease (poor circulation in legs/feet)

People with diabetes are 2-4x more likely to develop heart disease than those without it.

KNOW YOUR NUMBERS
You need to track more than just blood sugar:

Blood pressure: Under 130/80 (lower is often better)
Why: High BP damages blood vessels

Cholesterol:
- LDL ("bad"): Under 100 (under 70 if you have heart disease)
- HDL ("good"): Over 40 (men) or 50 (women)
- Triglycerides: Under 150
Why: High cholesterol clogs arteries

A1C: Under 7% for most people
Why: Every 1% drop reduces heart attack risk by 14%

PROTECTIVE MEDICATIONS
Your doctor might recommend:
- Statin (cholesterol med) - even if your cholesterol is "okay"
- Blood pressure meds
- Baby aspirin daily (ask your doctor first)
- Certain diabetes meds (like SGLT2 inhibitors or GLP-1s) that specifically protect your heart

LIFESTYLE CHANGES THAT MATTER MOST

Stop smoking: If you smoke, quitting is THE most important thing you can do. Seriously, more important than anything else on this list.

Get moving: 30 minutes most days. Doesn't have to be intense. Walking counts!

Eat heart-healthy:
- More: vegetables, fruits, whole grains, fish, nuts
- Less: saturated fat, trans fat, sodium, processed foods
- Mediterranean diet is proven to help

Manage stress: Chronic stress raises blood pressure and makes blood sugar harder to control.

Limit alcohol: Max 1 drink/day for women, 2 for men. Or none.

Lose weight: Even 10-15 pounds makes a difference if you're overweight.

WATCH FOR WARNING SIGNS
Call 911 immediately if you have:
- Chest pain or pressure (can feel like indigestion)
- Jaw, neck, or back pain
- Shortness of breath
- Nausea or lightheadedness
- Pain or numbness in arm or shoulder
- Extreme fatigue

Women especially: Symptoms can be subtler than classic chest pain. Don't ignore unusual fatigue, sleep problems, or stomach discomfort.

GET CHECKED
Ask your doctor about:
- EKG (checks heart rhythm)
- Stress test (if you have symptoms or high risk)
- Coronary calcium scan (measures plaque buildup)

REALISTIC EXPECTATIONS
You're not going to overhaul your entire life overnight. Pick 1-2 things to work on first. Maybe it's checking your BP regularly and taking a walk after dinner. Build from there.

The point: Diabetes increases heart risk, but good control + heart-healthy habits can reduce your risk back close to normal. You've got more control than you think.`,
        readTime: '7 min'
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Exercise',
    icon: '🏃',
    color: '#00bcd4',
    articles: [
      {
        title: 'Exercise and Blood Sugar',
        content: `Exercise is like medicine for diabetes - seriously, if it came in pill form, everyone would be taking it. But you need to know how it affects your blood sugar.

HOW EXERCISE HELPS
- Makes insulin work better (increased sensitivity)
- Lowers blood sugar during and after activity
- Helps with weight management
- Strengthens heart
- Reduces stress
- Improves mood and sleep

Different types do different things:

AEROBIC (cardio)
Walking, jogging, biking, swimming, dancing
Effect: Usually lowers blood sugar during and for hours after
Target: 150 minutes per week (like 30 min, 5 days)

RESISTANCE (strength training)
Weights, resistance bands, bodyweight exercises
Effect: Can raise blood sugar temporarily during workout, lowers it long-term by building muscle
Target: 2-3 times per week

FLEXIBILITY
Yoga, stretching
Effect: Minimal direct effect on blood sugar, but great for stress management
Bonus: Helps prevent injury

MANAGING BLOOD SUGAR DURING EXERCISE

Check before starting:
- Below 100: Have a snack (15g carbs)
- 100-250: Good to go
- Over 250: Check for ketones. If you have ketones, DO NOT exercise
- Over 300: Wait, even without ketones

During long workouts (over 45 min):
Check blood sugar every 30 minutes. Keep fast-acting carbs handy (glucose tabs, juice, gummies).

After exercise:
Blood sugar can drop for up to 24 hours after activity! This is called delayed hypoglycemia. Check more frequently, especially before bed.

TIPS TO PREVENT LOWS

If you take insulin or sulfonylureas:
- Reduce insulin before exercise (ask your doctor how much)
- Have a snack before/during activity
- Time workouts 1-2 hours after meals when blood sugar is higher

Carry emergency carbs: Always have something quick - juice box, glucose tabs, candy.

Wear ID: Medical alert bracelet that says you have diabetes.

STARTING A NEW EXERCISE ROUTINE

Start slow: If you've been sedentary, even 10 minutes counts. Work up gradually.

Find what you enjoy: You'll stick with it if you like it. Hate running? Don't run. Love dancing? That counts!

Schedule it: Put it on your calendar like any other appointment.

Track patterns: Check blood sugar before and after for a week or two. You'll learn how YOUR body responds to different activities.

Work with your team: Doctor or diabetes educator can help you adjust meds for exercise.

WHEN TO SKIP EXERCISE
- Blood sugar over 300
- You have ketones
- You feel dizzy, chest pain, or very short of breath
- You're sick

REAL TALK
Some days you won't feel like it. That's normal. On those days, can you do 10 minutes instead of 30? Take a walk around the block? Something is better than nothing.

Exercise doesn't have to mean going to a gym. Gardening counts. Playing with kids counts. Taking the stairs counts. Moving your body in ways you enjoy - that's what matters.`,
        readTime: '6 min'
      },
      {
        title: 'Stress Management',
        content: `Stress and diabetes are a terrible combination. Stress hormones (cortisol and adrenaline) tell your liver to release glucose, which raises your blood sugar. Plus, when you're stressed, you're more likely to skip exercise, eat junk food, and forget to check your blood sugar.

HOW STRESS AFFECTS YOU
Physical: Raises blood sugar, increases blood pressure, weakens immune system, causes headaches and muscle tension

Mental: Anxiety, trouble sleeping, difficulty concentrating, irritability, burnout

It's a cycle: Diabetes causes stress, stress raises blood sugar, high blood sugar causes more stress...

STRESS MANAGEMENT TECHNIQUES

BREATHING EXERCISES
Simple but powerful. Try this:
- Breathe in for 4 counts
- Hold for 4
- Out for 4
- Repeat for 5 minutes

Do it when you're waiting for blood sugar results, stuck in traffic, before bed.

EXERCISE
Even a 10-minute walk reduces stress hormones. Bonus: Also lowers blood sugar directly.

MEDITATION/MINDFULNESS
Don't overthink it. Even 5 minutes of quiet sitting helps. Apps like Headspace or Calm have guided options.

SLEEP
Easier said than done, I know. But lack of sleep raises stress hormones AND makes blood sugar harder to control. Aim for 7-9 hours.

CONNECT WITH PEOPLE
Talk to friends, family, a therapist, or a diabetes support group. Feeling isolated makes everything harder.

DO THINGS YOU ENJOY
Not everything has to be about diabetes. Make time for hobbies, fun, relaxation. It's not selfish - it's necessary.

SET BOUNDARIES
It's okay to say no. You can't do everything for everyone, especially when managing a chronic condition.

DIABETES-SPECIFIC STRESS

"Diabetes burnout" is real. You might feel:
- Exhausted by constant monitoring
- Frustrated with numbers that don't make sense
- Guilty about "cheating" on your diet
- Overwhelmed by all the tasks

If this is you:
- Talk to your healthcare team about simplifying your routine
- Give yourself permission to not be perfect
- Consider seeing a therapist who specializes in chronic illness
- Take it one day, one meal, one reading at a time

PRACTICAL STRESS REDUCERS
- Keep a gratitude journal
- Limit news/social media
- Get outside in nature  
- Listen to music
- Pet a dog or cat
- Take a bath
- Laugh (watch comedy, talk to a funny friend)

WHEN TO GET HELP
If stress is affecting your daily life - can't sleep, can't concentrate, feeling hopeless, panic attacks - talk to your doctor. Therapy and/or medication can help. There's no shame in needing support.

Remember: Managing diabetes is stressful. You're dealing with a lot. Be kind to yourself. Some days you'll crush it, some days you'll barely get by. That's okay. Tomorrow's a new day.`,
        readTime: '5 min'
      },
      {
        title: 'Sleep and Diabetes',
        content: `Sleep and blood sugar are more connected than most people realize. Poor sleep makes diabetes harder to control, and diabetes can mess with your sleep. Let's fix that cycle.

HOW SLEEP AFFECTS BLOOD SUGAR

Too little sleep (less than 6 hours):
- Raises cortisol (stress hormone)
- Increases insulin resistance
- Makes you crave junk food
- Decreases willpower to make healthy choices
- Can raise A1C by 0.4-1% over time

Studies show people who sleep 6 hours or less have significantly worse blood sugar control than those who sleep 7-8 hours.

HOW DIABETES AFFECTS SLEEP

High blood sugar: Makes you pee frequently (interrupting sleep), causes thirst, can cause headaches

Low blood sugar: Night sweats, nightmares, morning headaches. You might not wake up, but your sleep quality suffers.

Neuropathy: Nerve pain can make it hard to get comfortable.

Sleep apnea: More common with Type 2 diabetes. You stop breathing briefly during sleep, waking you up (sometimes without realizing it).

TIPS FOR BETTER SLEEP

BLOOD SUGAR-SPECIFIC

Check at bedtime: Aim for 100-140 mg/dL. Too low? Have a snack. Too high? Don't eat before bed.

Consistent meal timing: Eating at the same times helps regulate nighttime blood sugar.

Evening snack (if needed): Small protein + carb snack can prevent nighttime lows. Try: apple with peanut butter, cheese and crackers, Greek yogurt.

Avoid high-carb evening meals: Can cause spikes that disrupt sleep.

GENERAL SLEEP HYGIENE

Stick to a schedule: Same bed and wake time, even weekends. Your body likes routine.

Create a bedtime routine: Signals your brain it's time to wind down. Could be: brush teeth, light stretching, reading, meditation.

Keep it cool: 65-68°F is ideal. Your body temperature drops during sleep.

Dark room: Blackout curtains or eye mask. Light suppresses melatonin.

No screens 30-60 min before bed: Blue light from phones/tablets disrupts sleep. If you must use them, enable night mode.

Watch caffeine: None after 2pm. It stays in your system for hours.

Limit alcohol: Might help you fall asleep but ruins sleep quality and can affect blood sugar.

Exercise: But not within 3 hours of bedtime (too stimulating).

Use bed for sleep only: Not for watching TV, working, scrolling phone. Your brain should associate bed with sleep.

IF YOU CAN'T SLEEP
Don't lie there stressing. After 20 minutes, get up and do something boring in dim light until you feel sleepy.

SLEEP APNEA WARNING SIGNS
- Loud snoring
- Gasping or choking during sleep
- Extreme daytime tiredness
- Morning headaches
- Waking with dry mouth

If this sounds like you, talk to your doctor. Sleep apnea makes diabetes harder to control, but it's treatable (usually with a CPAP machine).

REALISTIC GOALS
If you're currently sleeping 5 hours, don't try to jump to 8 immediately. Add 15-30 minutes. Work up gradually.

Track it: Note your sleep hours and morning blood sugar for a week. You'll see the connection.

The payoff: Better sleep = better blood sugar control = feeling better = easier to make healthy choices = even better blood sugar. It's a positive cycle worth starting.`,
        readTime: '4 min'
      }
    ]
  }
];

const tips = [
  {
    category: 'Daily Tip',
    tip: 'Always carry fast-acting carbohydrates like glucose tablets for low blood sugar emergencies.',
    icon: '💡'
  },
  {
    category: 'Nutrition Tip',
    tip: 'Pair carbohydrates with protein and healthy fats to slow down glucose absorption.',
    icon: '🥗'
  },
  {
    category: 'Exercise Tip',
    tip: 'Check your blood sugar before, during, and after exercise to understand how activity affects you.',
    icon: '🏃'
  },
  {
    category: 'Monitoring Tip',
    tip: 'Keep a detailed log of your blood sugar readings, meals, and activities to identify patterns.',
    icon: '📝'
  }
];

export default function DiabetesEducation({ isDark = false }: DiabetesEducationProps) {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<any>(null);

  const CategoryCard = ({ cat }: any) => {
    const isOpen = openCat === cat.id;
    
    return (
    <TouchableOpacity
        key={cat.id}
        style={[styles.catCard, { backgroundColor: isDark ? '#2d3a4d' : '#fff' }]}
        onPress={() => setOpenCat(isOpen ? null : cat.id)}
      >
        <View style={styles.catTop}>
          <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
            <Text style={styles.iconTxt}>{cat.icon}</Text>
        </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.catTitle, { color: isDark ? '#fff' : '#333' }]}>
              {cat.title}
          </Text>
            <Text style={[styles.artCount, { color: isDark ? '#ccc' : '#666' }]}>
              {cat.articles.length} articles
          </Text>
        </View>
        <Ionicons 
            name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={isDark ? '#fff' : '#333'} 
        />
      </View>
      
        {isOpen && (
          <View style={styles.artList}>
            {cat.articles.map((art: any, i: number) => (
            <TouchableOpacity
                key={i}
                style={[styles.artCard, { backgroundColor: isDark ? '#1e2a3a' : '#f8f9fa' }]}
                onPress={() => setActiveArticle(art)}
              >
                <Text style={[styles.artTitle, { color: isDark ? '#fff' : '#333' }]}>
                  {art.title}
              </Text>
                <Text 
                  style={[styles.preview, { color: isDark ? '#ccc' : '#666' }]}
                  numberOfLines={2}
                >
                  {art.content.split('\n\n')[0]}
              </Text>
                <Text style={[styles.time, { color: isDark ? '#999' : '#999' }]}>
                  {art.readTime}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#181a20' : '#f6f8fa' }]}>
      <View style={[styles.top, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>
          Diabetes Education
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
          Learn how to manage your diabetes effectively
        </Text>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <View style={[styles.tipsArea, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
          <Text style={[styles.header, { color: isDark ? '#fff' : '#333' }]}>
            Daily Tips
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tipRow}>
              {tips.map((t, idx) => (
                <View key={idx} style={[styles.tipBox, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
                  <Text style={styles.tipEmoji}>{t.icon}</Text>
                  <Text style={[styles.tipCat, { color: isDark ? '#ccc' : '#666' }]}>
                    {t.category}
                  </Text>
                  <Text style={[styles.tipTxt, { color: isDark ? '#fff' : '#333' }]}>
                    {t.tip}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.catSection}>
          <Text style={[styles.header, { color: isDark ? '#fff' : '#333' }]}>
            Learning Topics
          </Text>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </View>

      </ScrollView>

      {activeArticle && (
        <Modal visible={true} animationType="slide">
          <View style={[styles.modalWrap, { backgroundColor: isDark ? '#181a20' : '#fff' }]}>
            <View style={[styles.modalTop, { backgroundColor: isDark ? '#232b3a' : '#fff' }]}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setActiveArticle(null)}
              >
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#333' }]}>
                {activeArticle?.title}
              </Text>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.bodyTxt, { color: isDark ? '#fff' : '#333' }]}>
                {activeArticle?.content}
              </Text>
              
              <View style={[styles.disclaimer, { backgroundColor: isDark ? '#2d3a4d' : '#f8f9fa' }]}>
                <Text style={[styles.disclaimerTxt, { color: isDark ? '#ccc' : '#666' }]}>
                  This article is for educational purposes only and should not replace professional medical advice. 
                  Always consult with your healthcare provider for personalized guidance.
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  main: {
    flex: 1,
    padding: 16,
  },
  tipsArea: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tipBox: {
    width: 200,
    padding: 16,
    borderRadius: 12,
  },
  tipEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipCat: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipTxt: {
    fontSize: 14,
    lineHeight: 20,
  },
  catSection: {
    marginBottom: 20,
  },
  catCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  catTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconTxt: {
    fontSize: 24,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artCount: {
    fontSize: 14,
  },
  artList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  artCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  artTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
  },
  modalWrap: {
    flex: 1,
  },
  modalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  closeBtn: {
    marginRight: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  bodyTxt: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  disclaimer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  disclaimerTxt: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
