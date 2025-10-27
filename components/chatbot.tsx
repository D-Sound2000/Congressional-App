import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';

const SPOONACULAR_API_KEY = '75eb74379764490691e81b22b93ebf10';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: Message = {
      text: "Hey there! 👋 I'm so excited to help you with all things food and nutrition! \n\nI absolutely LOVE talking about:\n🍳 Delicious recipes (especially diabetes-friendly ones!)\n💪 Nutrition tips that actually work\n🥗 Meal planning made easy\n✨ Making healthy eating enjoyable\n\nWhat's cooking? Tell me what you're in the mood for, or just say hi! 😊",
      sender: 'bot',
      timestamp: Date.now()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Check if user is asking for recipes
  const isRecipeRequest = (userInput: string): boolean => {
    const input = userInput.toLowerCase();
    const recipeKeywords = ['recipe', 'recipes', 'cook', 'cooking', 'make', 'making', 'prepare', 'dish', 'dishes', 'meal', 'meals', 'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'snacks', 'food', 'chicken', 'salad', 'pasta', 'soup', 'bread', 'cake'];
    const hasKeyword = recipeKeywords.some(keyword => input.includes(keyword));
    console.log('Checking recipe request for:', input, 'Has keyword:', hasKeyword);
    return hasKeyword;
  };

  // Search for actual recipes using Spoonacular API
  const searchRecipes = async (query: string): Promise<any[]> => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=3&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Recipe search failed');
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Recipe search error:', error);
      return [];
    }
  };


  // Fallback recipes for when API fails
  const getFallbackRecipes = (query: string): string => {
    const input = query.toLowerCase();
    
    if (input.includes('chicken')) {
      return `OMG, you're going to LOVE this chicken recipe! 🍗✨ It's honestly one of my absolute favorites - so flavorful and perfect for anyone managing diabetes!

🌟 **My Famous Herb-Crusted Baked Chicken**

⏱️ **Takes about 45 minutes total** (but most of that is just waiting while it bakes!) | **Feeds 4 hungry people**

**Here's what you'll need:**
• 4 chicken breasts (I like the 6 oz ones - not too big, not too small!)
• 2 tbsp good olive oil (trust me, don't cheap out here!)
• 1 tsp garlic powder (or fresh if you're feeling fancy)
• 1 tsp sweet paprika (gives it that gorgeous color!)
• 1 tsp dried oregano
• 1/2 tsp thyme
• 1/2 tsp onion powder
• Salt and pepper to taste
• 1/2 tsp rosemary
• 1 whole lemon for juicing

**Let's make some magic happen:**
1. First things first - crank that oven to 375°F! Line your baking dish with parchment (makes cleanup a breeze, you'll thank me later).

2. Pat those chicken breasts completely dry - this is KEY for getting that perfect crust! If they're super thick, give them a gentle pound to even them out.

3. Mix all your spices with the olive oil in a bowl. It'll smell absolutely incredible!

4. Now comes the fun part - massage that herb mixture all over the chicken. Don't be shy, really get in there!

5. Pop them in the dish, squeeze that lemon all over (so good!), and into the oven they go.

6. Bake for 25-30 minutes until they hit 165°F inside. No pink, but don't overcook them!

7. Here's the secret - let them REST for 10 minutes before cutting. I know it's torture, but it keeps all the juices in!

**Why your blood sugar will thank you:** Only 2g carbs, but 35g of protein! The herbs are anti-inflammatory too. Serve with some roasted veggies and you've got yourself a perfect diabetes-friendly feast! 🎉`;
    }
    
    if (input.includes('salad')) {
      return `Ooh, you want a salad? I've got the PERFECT one for you! 🥗😍 This Mediterranean quinoa salad is like summer in a bowl - fresh, colorful, and so satisfying!

🌅 **My Go-To Mediterranean Quinoa Salad**

🕰️ **About 35 minutes from start to finish** (quinoa needs to cook and cool!) | **Plenty for 4 as a side, or 2 for lunch**

**Grab these goodies:**
• 1 cup quinoa (rinse it first - gets rid of the bitter coating!)
• 2 cups veggie broth (makes it way more flavorful than water)
• 1 big cucumber, diced (I love the crunch!)
• 1 1/2 cups cherry tomatoes, cut in half
• 1/4 cup red onion, minced fine (don't go crazy here!)
• 1/2 cup Kalamata olives (the good stuff!)
• 1/2 cup crumbled feta (because... feta makes everything better)
• Fresh parsley and mint (seriously, don't skip these!)
• 3 tbsp good olive oil
• 2 tbsp fresh lemon juice
• 1 garlic clove, minced
• Oregano, salt, and pepper

**Let's build this beauty:**
1. Cook your quinoa in the veggie broth - it's like giving it a flavor bath! 15 minutes covered, then let it rest and fluff it up.

2. While it's cooling (patience, my friend!), dice up all your veggies. Make them roughly the same size - it's prettier that way!

3. Whisk up that dressing - the lemon and olive oil combo is *chef's kiss*

4. Once everything's cool, toss it all together! Don't be gentle - really mix it up!

5. Here's the secret: let it chill for at least 30 minutes. The flavors get SO much better when they hang out together!

**Your diabetes-friendly win:** The quinoa gives you complete protein (rare for a grain!), tons of fiber to keep blood sugar steady, and those healthy Mediterranean fats are absolute gold! Plus it's only 28g carbs but packed with nutrients. This is what I call a power bowl! 💪✨`;
    }

    if (input.includes('breakfast')) {
      return `Oh my gosh, YES! Breakfast is my favorite meal to jazz up! 🍳✨ This veggie scramble is like a rainbow on your plate - and it'll keep you satisfied all morning!

🌅 **The Ultimate Feel-Good Veggie Scramble**

⏰ **Ready in under 20 minutes!** | **Perfect for 2 (or just you if you're extra hungry!)**

**Here's your morning lineup:**
• 4 beautiful eggs (the stars of the show!)
• 2 tbsp unsweetened almond milk (makes them so fluffy!)
• 1 tbsp olive oil
• 1/4 onion, diced small
• Half a red bell pepper (for that pop of color!)
• Half a green bell pepper
• A big handful of spinach
• Some mushrooms, sliced
• 1/4 cup shredded cheddar (because life's too short for bland eggs!)
• Fresh chives for that fancy finish
• Salt, pepper, and garlic powder

**Let's make breakfast magic:**
1. Whisk those eggs with the almond milk and seasonings until they're all happy together!

2. Heat up your pan - medium heat is your friend here. Too hot and you'll have rubbery eggs (yuck!).

3. Sauté the onions first (they need more time), then add those gorgeous peppers and mushrooms. Listen to that sizzle!

4. Toss in the spinach and watch it magically shrink down in seconds!

5. Now for the good part - pour in those eggs and DON'T TOUCH for 30 seconds. Then gently scramble like you're folding laundry!

6. Right before they're done, fold in that cheese. Remove from heat - they'll finish cooking from the residual heat!

7. Sprinkle with chives and boom - you've got yourself a restaurant-worthy breakfast!

**Why this rocks for blood sugar:** You're getting 18g of protein (hello, steady energy!), tons of veggies for fiber and nutrients, and only 6g carbs. Your morning blood sugar will be as stable as your good mood after eating this! Pair with some avocado and you're absolutely golden! 🌟`;
    }

    // For general requests, provide a specific recipe
    if (input.includes('food') || input.includes('meal') || input.includes('dinner')) {
      return `Oh, you want something hearty and delicious? I've got JUST the thing! 🥘✨ This one-pot wonder is my go-to when I want maximum flavor with minimal cleanup!\n\n🏺 **My Famous One-Pot Mediterranean Chicken**\n\n⏰ **50 minutes of pure comfort food magic** | **Feeds 4 very happy people**\n\n**What you'll need:**\n• 4 chicken thighs (bone-in, skin-on - trust me on this!)\n• 2 tbsp olive oil\n• 1 onion, diced\n• 3 garlic cloves, minced (or more if you're like me!)\n• 1 red bell pepper, chunked up\n• 1 zucchini, sliced\n• Cherry tomatoes (about a cup, halved)\n• Kalamata olives (because they're amazing!)\n• Oregano, thyme, salt, and pepper\n• Fresh parsley for the final flourish\n\n**Let's cook something incredible:**\n1. Get that olive oil nice and hot in your biggest skillet!\n\n2. Season those chicken thighs like they're going to a party, then sear them skin-side down. Don't move them! Let them get gorgeously golden (5-6 minutes).\n\n3. Flip and cook the other side, then set them aside to rest.\n\n4. In that same pan (don't you dare wash it - all that flavor!), sauté your onion and garlic until your kitchen smells like heaven.\n\n5. Add the bell pepper and zucchini - let them get happy and slightly caramelized.\n\n6. Toss in tomatoes and olives, nestle that chicken back in, cover, and let it all simmer together for 15-20 minutes.\n\n7. Finish with fresh parsley and prepare for compliments!\n\n**Why this is perfect for you:** One pan = easy portion control, loads of veggies, and only 12g carbs per serving! Plus, all those Mediterranean flavors are incredible for heart health. This is comfort food that loves you back! 💕`;
    }

    return `Oh, I'm getting so excited thinking about all the delicious things we could make together! 🤩\n\nHere are some of my absolute favorites:\n\n🍗 **When you want protein power:** My herb-crusted chicken, perfectly grilled fish, or these amazing turkey meatballs I'm obsessed with!\n\n🥗 **For fresh and fabulous:** Mediterranean quinoa salad (it's like summer!), Greek village salad that'll transport you, or this spinach berry combo that's pure magic!\n\n🍳 **Morning fuel:** Veggie scrambles that'll make you jump out of bed, Greek yogurt parfaits, or overnight oats that prep themselves!\n\n🥘 **One-pot wonders:** Vegetable stir-fries, soul-warming lentil soups, or my famous Mediterranean chicken!\n\nJust tell me what you're in the mood for - like \"I want something with chicken\" or \"give me a healthy breakfast idea\" - and I'll share all my secrets! What sounds good to you? 😊`;
  };

  // Fallback responses for common questions
  const getFallbackResponse = (userInput: string): string | null => {
    const input = userInput.toLowerCase();
    
    if (input.includes('diabetes') || input.includes('diabetic')) {
      return "Oh, diabetes management - that's so important and you're in the right place! 💪 Here's what I've learned really works:\n\n🥬 **Focus on the good stuff:** Leafy greens, lean proteins, and whole grains are your best friends! They help keep your blood sugar steady.\n\n⏰ **Timing is everything:** Try to eat at regular times - your body loves routine!\n\n🍽️ **Portions matter:** But don't stress too much about perfection. It's about progress, not perfection!\n\nI've got SO many diabetes-friendly recipes that are actually delicious (promise!). What kind of food are you in the mood for? And remember, always check with your healthcare team too - they know you best! 😊";
    }
    
    if (input.includes('nutrition') || input.includes('calories') || input.includes('healthy')) {
      return "Yay for wanting to eat well! 🌟 I'm all about making healthy eating actually enjoyable (because life's too short for boring food!).\n\nHere's my simple approach:\n\n🌈 **Eat the rainbow:** Lots of colorful veggies and fruits\n💪 **Protein power:** Keeps you satisfied and energized\n🌾 **Good carbs:** Think whole grains that actually taste good\n✨ **Real food:** The less processed, the better your body feels!\n\nBut honestly, what specific thing are you curious about? Are you trying to meal prep? Want to know about a certain food? Looking for energy-boosting snacks? I love getting into the details with you!";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hey there! 👋 So good to meet you! I'm absolutely thrilled you're here - I could talk about food and nutrition ALL day long! 😊\n\nWhat's on your mind? Are you looking for:\n🍳 A killer recipe?\n💡 Some nutrition tips?\n🥗 Meal planning help?\n🍎 Just want to chat about healthy eating?\n\nI'm here for ALL of it! What sounds good to you?";
    }
    
    return null;
  };

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { 
      text: input.trim(), 
      sender: 'user', 
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = input.trim();
    setInput('');

    try {
      // Check if user is asking for recipes - ALWAYS provide a recipe response
      if (isRecipeRequest(currentInput)) {
        console.log('Recipe request detected for:', currentInput);
        
        // Always provide fallback recipes first (reliable)
        const fallbackRecipe = getFallbackRecipes(currentInput);
        
        // Try to get API recipes as well, but don't wait for them
        try {
          const recipes = await searchRecipes(currentInput);
          console.log('API returned', recipes.length, 'recipes');
          
          if (recipes.length > 0) {
            const recipe = recipes[0];
            let apiRecipeText = `\n\n---\n\n✨ **Oh, and I found this gem in my recipe collection that you might love too!**\n\n🍽️ **${recipe.title}**\n\n`;
            
            if (recipe.readyInMinutes) {
              apiRecipeText += `⏱️ **Ready in:** ${recipe.readyInMinutes} minutes (not too shabby!)\n`;
            }
            
            if (recipe.servings) {
              apiRecipeText += `👥 **Perfect for:** ${recipe.servings} people\n`;
            }
            
            if (recipe.sourceUrl) {
              apiRecipeText += `\n🔗 **Get the full recipe:** ${recipe.sourceUrl}\n`;
            }
            
            // Add more suggestions
            if (recipes.length > 1) {
              apiRecipeText += `\n**And if you're feeling adventurous, check these out too:**\n`;
              recipes.slice(1, 3).forEach((r: any) => {
                apiRecipeText += `• ${r.title} (looks amazing!)\n`;
              });
            }
            
            const combinedRecipe = fallbackRecipe + apiRecipeText;
            
            const botMessage: Message = {
              text: combinedRecipe,
              sender: 'bot',
              timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API failed, using fallback only:', apiError);
        }
        
        // Always return fallback recipe (this ensures recipes are ALWAYS provided)
        const botMessage: Message = {
          text: fallbackRecipe,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        return;
      }

      // Check for other fallback responses
      const fallbackResponse = getFallbackResponse(currentInput);
      if (fallbackResponse) {
        const botMessage: Message = {
          text: fallbackResponse,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        return;
      }

      // For non-recipe questions, use conversation API
      const response = await fetch(
        `https://api.spoonacular.com/food/converse?text=${encodeURIComponent(
          currentInput
        )}&apiKey=${SPOONACULAR_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      let botText = data.answerText || '';

      // If no response from API, use intelligent fallback
      if (!botText) {
        botText = `Hmm, I'm not quite sure what you're looking for, but I'm SO excited to help! 😊\n\nMaybe try asking me something like:\n\n🍳 "What should I make for breakfast?"\n🍗 "Give me a healthy chicken recipe!"\n🥗 "What veggies are best for diabetics?"\n🌽 "How do I meal prep?"\n\nI've got tons of ideas just waiting to share with you! What sounds interesting?`;
      }

      const botMessage: Message = {
        text: botText,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // If it was a recipe request and API failed, provide fallback recipes
      if (isRecipeRequest(currentInput)) {
        const fallbackRecipe = getFallbackRecipes(currentInput);
        const errorMessage: Message = {
          text: `Oops! My recipe database is being a little cranky right now 😅, but don't worry - I've still got you covered! Here's one of my personal favorites:\n\n${fallbackRecipe}`,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        // Provide helpful error message with suggestions
        const errorMessage: Message = {
          text: `Oh no! My connection is being a bit wonky right now 😅, but hey - I can still chat about food and nutrition!\n\n💚 **Quick diabetes tips:** Load up on leafy greens, lean proteins, and whole grains - your blood sugar will thank you!\n\n🍳 **Cooking hacks:** Baking, grilling, and steaming are your best friends for healthy, tasty meals!\n\n🍎 **Smart shopping:** Check those labels for sneaky carbs and added sugars!\n\nWhat would you love to know more about? I'm here and ready to chat! 😊`,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const parts = item.text.split(/\n/);

    return (
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userBubble : styles.botBubble,
        ]}
      >
        {parts.map((part, index) => {
          const trimmedPart = part.trim();
          const isLink = trimmedPart.startsWith('http') || trimmedPart.includes('spoonacular.com');
          const isBold = trimmedPart.startsWith('**') && trimmedPart.endsWith('**');
          let displayText = trimmedPart;
          
          if (isBold) {
            displayText = trimmedPart.slice(2, -2);
          }
          
          // Handle recipe source URLs specifically
          if (trimmedPart.includes('🔗 **Full Recipe:**')) {
            const urlMatch = trimmedPart.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
              const url = urlMatch[0];
              return (
                <Text key={index} style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>
                  🔗 <Text style={styles.boldText}>Full Recipe: </Text>
                  <Text 
                    style={styles.linkText}
                    onPress={() => Linking.openURL(url)}
                  >
                    Click here to view complete recipe
                  </Text>
                </Text>
              );
            }
          }
          
          return (
            <Text
              key={index}
              style={[
                styles.messageText,
                isLink && styles.linkText,
                isBold && styles.boldText,
                item.sender === 'user' ? styles.userMessageText : styles.botMessageText
              ]}
              onPress={() => isLink && Linking.openURL(trimmedPart)}
            >
              {displayText || ' '}
            </Text>
          );
        })}
      </View>
    );
  }

  const renderTypingIndicator = () => (
    <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
      <Text style={[styles.messageText, styles.botMessageText]}>
        Hmm, let me think about this... 🤔
      </Text>
      <ActivityIndicator size="small" color="#666" style={{ marginLeft: 8 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />
      
      {isLoading && renderTypingIndicator()}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          placeholder="What's cooking? Ask me anything about food! 😊"
          placeholderTextColor="#999"
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          editable={!isLoading}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (isLoading || !input.trim()) && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          <Text style={[styles.sendButtonText, (isLoading || !input.trim()) && styles.sendButtonTextDisabled]}>
            {isLoading ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 3,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderColor: '#e1e5e9',
    borderWidth: 1,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#1c1e21',
  },
  boldText: {
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f3f4',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sendButtonTextDisabled: {
    color: '#e0e0e0',
  },
});