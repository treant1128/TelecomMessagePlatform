import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;

public class ExactPhoneNumberFromLog {
    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入访问日志文件的全路径: ");
        String logPath = scanner.nextLine();
        System.out.println("请输入想要输出号码文件路径: ");
        String outPath = scanner.nextLine();
        BufferedReader bufferedReader = null;
        BufferedWriter bufferedWriter = null;
        Set<String> allNumbers = new HashSet<String>();

        try {
            bufferedReader = new BufferedReader(new InputStreamReader(
                    new FileInputStream(new File(logPath)), "GBK"));
            bufferedWriter = new BufferedWriter(new OutputStreamWriter(
                    new FileOutputStream(new File(outPath)), "GBK"));
        } catch (UnsupportedEncodingException e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        } catch (FileNotFoundException e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        }

        String line = null;
        String[] temp = null;
        try {
            while ((line = bufferedReader.readLine()) != null) {
                temp = line.split(" ");
                if (temp.length > 1) {
                    line = temp[1];
//                    System.out.println("line: " + line);
                    if (line.length() == 11 && line.charAt(0) == '1'
                            && allNumbers.add(line)) {
                        bufferedWriter.write(line + '\n');
                    }
                }
            }
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } finally {
            try {
                if (bufferedReader != null) {
                    bufferedReader.close();
                }
                if (bufferedWriter != null) {
                    bufferedWriter.close();
                }

                System.out.println("去重复后的号码数量: " + allNumbers.size());
                System.out.println("耗时: "
                        + (System.currentTimeMillis() - start) + " ms");
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }
}

